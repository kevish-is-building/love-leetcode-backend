import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { UserRole } from "../generated/prisma/index.js";
import { getLanguageName } from "../libs/judge0.lib.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        playlist: true,
        problems: true,
        solvedBy: true,
        submission: true,
      },
    });
    if (!users || users.length === 0) {
      return res.status(404).json(new ApiError(404, "No users found"));
    }

    res.status(200).json(new ApiResponse(200, "Users retrieved successfully", users));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error while fetching users"));
  }
};

const getAllProblems = async (req,res) => {
    try {
        const problems = await db.problem.findMany({
            select: {
                id: true,
                title: true,
                difficulty: true,
                tags: true,
                description: true,
                solvedBy: true,
                problemInPlaylist: true,
                submission: true,
                referenceSolution: true,
                updatedAt: true,
                createdAt: true,
            },
        });
        if (!problems || problems.length === 0) {
            return res.status(404).json(new ApiError(404, "No problems found"));
        }
        res.status(200).json(new ApiResponse(200, "Problems retrieved successfully", problems));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error while fetching problems"));
    }
}

const getAllPlaylists = async (req,res) => {
    try {
        const playlists = await db.playlist.findMany({
            select: {
                id: true,
                name: true,
                user: true,
                description: true,
                problems: true,
                updatedAt: true,
                createdAt: true,
            },
        });
        if (!playlists || playlists.length === 0) {
            return res.status(404).json(new ApiError(404, "No playlists found"));
        }
        res.status(200).json(new ApiResponse(200, "Playlists retrieved successfully", playlists));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error while fetching playlists"));
    }
}

const getAllSubmissions = async (req,res) => {
    try {
        const submissions = await db.submission.findMany({
            select: {
                id: true,
                user: true,
                problemTitle: true,
                status: true,
                language: true,
                sourceCode: true,
            }
        });
        if (!submissions || submissions.length === 0) {
            return res.status(404).json(new ApiError(404, "No submissions found"));
        }
        res.status(200).json(new ApiResponse(200, "Submissions retrieved successfully", submissions));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error while fetching submissions"));
    }
}


export {getAllUsers, getAllProblems, getAllPlaylists, getAllSubmissions}