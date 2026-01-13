import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const register = async (req, res) => {
  const { name, email, password, image } = req.body;
  
  if (!name || !email || !password) {
    return res.status(401).json(new ApiError(401, "All fields are required"));
  }
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json(new ApiError(400, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userImage = image;
    if (!userImage) {
      userImage = null;
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
        image: userImage || null, // Optional image field
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const cookieOptions = {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
    res.cookie("jwt", token, cookieOptions);

    res.status(201).json(
      new ApiResponse(
        201,
        "User successfully registered",
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }
      )
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Unable to register user"));
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "User does not exists"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid Credentials"));
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const cookieOptions = {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
    res.cookie("jwt", token, cookieOptions);

    res.status(200).json(
      new ApiResponse(
        200,
        `Login successful, Welcome ${user.name}`,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }
      )
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Unable to login user"));
  }
};

const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
    res.clearCookie("jwt",cookieOptions);

    res.status(200).json(new ApiResponse(200,"User successfully logout"))
  } catch (error) {
    res.status(500).json(new ApiError(500,"Unable to logout"))
  }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json(new ApiResponse(200,"Profile fetched Successfully",req.user))
    } catch (error) {
        res.status(500).json(new ApiError(500,"Error while Getting user"))
    }
};

const googleAuthRedirect = async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString("hex");

    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      state,
    });
    console.log("======", `${GOOGLE_AUTH_URL}?${params}`)
    res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  } catch (error) {
    res.status(500).json(new ApiError(500, "Failed to initialize Google auth"));
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json(new ApiError(400, "Invalid OAuth request"));
    }

    if (state !== req.cookies.oauth_state) {
      return res.status(401).json(new ApiError(401, "Invalid OAuth state"));
    }

    res.clearCookie("oauth_state");

    // Exchange authorization code for tokens
    const { data: tokenData } = await axios.post(
      GOOGLE_TOKEN_URL,
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // Get user info from Google
    const { data: googleUser } = await axios.get(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const {
      id: googleId,
      email,
      name,
      picture,
    } = googleUser;

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
    });

    if (user && user.googleId && user.googleId !== googleId) {
      return res.status(409).json(new ApiError(409, "OAuth account mismatch"));
    }

    if (!user) {
      user = await db.user.create({
        data: {
          name,
          email,
          image: picture,
          googleId,
          password: null,
          role: UserRole.USER,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId,
          name: name || user.name,
          image: picture || user.image,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    res.cookie("jwt", token, cookieOptions);

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(frontendUrl);
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.status(500).json(new ApiError(500, "Failed to authenticate with Google"));
  }
};

export { register, login, logout, getMe, googleAuthRedirect, googleAuthCallback };
