import {
  getProblemDifficultyCount,
  getUserSolvedProblemCount,
} from "../functions/problemFunctions.js";
import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getUserCount = async (req, res) => {
  try {
    const userCount = await db.user.count();

    res.status(200).json(
      new ApiResponse(200, "User count fetched successfully", {
        count: userCount,
      }),
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Failed to fetch user count"));
  }
};

const getProblemCount = async (req, res) => {
  try {
    const problemCount = await db.problem.count();

    res.status(200).json(
      new ApiResponse(200, "Problem count fetched successfully", {
        count: problemCount,
      }),
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Failed to fetch problem count"));
  }
};

const getUserSubmissionCount = async (req, res) => {
  try {
    // get total submission count of user

    const submissionCount = await db.submission.count({
      where: { userId: req.user.id },
    });

    res.status(200).json(
      new ApiResponse(200, "Submission count fetched successfully", {
        count: submissionCount,
      }),
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Failed to fetch submission count"));
  }
};

const getUserTotalSolvedProblemsCount = async (req, res) => {
  try {
    const totalSolvedProblemsCount = await db.problemSolved.count({
      where: {
        userId: req.user.id,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Total solved problems count fetched successfully",
          { count: totalSolvedProblemsCount },
        ),
      );
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json(new ApiError(500, "Failed to fetch total solved problems count"));
  }
};

const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const difficultyCount = await getProblemDifficultyCount();
    const solvedCount = await getUserSolvedProblemCount(userId);

    res.status(200).json(
      new ApiResponse(200, "User progress fetched successfully", {
        difficultyCount,
        solvedCount,
      }),
    );
  } catch (error) {
    console.log(error)
    res.status(500).json(new ApiError(500, "Failed to fetch user progress"));
  }
};

export {
  getUserCount,
  getProblemCount,
  getUserSubmissionCount,
  getUserTotalSolvedProblemsCount,
  getUserProgress,
};
