import { db } from "../libs/db.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"


const getUserCount = async (req, res) => {
    try {
        const userCount = await db.user.count()

        res.status(200).json(new ApiResponse(200, "User count fetched successfully", { count: userCount }))
    } catch (error) {
        res.status(500).json(new ApiError(500,"Failed to fetch user count"))
    }
};

const getProblemCount = async (req, res) => {
    try {
        const problemCount = await db.problem.count()

        res.status(200).json(new ApiResponse(200, "Problem count fetched successfully", { count: problemCount }))
    } catch (error) {
        res.status(500).json(new ApiError(500,"Failed to fetch problem count"))
    }
};

const getSubmissionCount = async (req, res) => {
    try {
        const submissionCount = await db.submission.count()

        res.status(200).json(new ApiResponse(200, "Submission count fetched successfully", { count: submissionCount }))
    } catch (error) {
        res.status(500).json(new ApiError(500,"Failed to fetch submission count"))
    }
};

export { getUserCount, getProblemCount, getSubmissionCount };