import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const getProblemDifficultyCount = async () => {
  try {
    const difficulties = await db.problem.findMany({
      select: {
        difficulty: true,
      },
    });

    const easyCount = difficulties.filter(
      (problem) => problem.difficulty === "EASY",
    ).length;
    const mediumCount = difficulties.filter(
      (problem) => problem.difficulty === "MEDIUM",
    ).length;
    const hardCount = difficulties.filter(
      (problem) => problem.difficulty === "HARD",
    ).length;

    return { easyCount, mediumCount, hardCount };
  } catch (error) {
    return `Failed to fetch problem count ${error.message}`;
  }
};

const getUserSolvedProblemCount = async (userId) => {
  try {
    const useSolvedProblemCount = await db.problemSolved.findMany({
      where: {
        userId: userId,
      },
      select: {
        problem: {
          select: {
            difficulty: true,
          },
        },
      },
    });


    const easySolved = useSolvedProblemCount.filter(
      (entry) => entry.problem.difficulty === "EASY",
    ).length;
    const mediumSolved = useSolvedProblemCount.filter(
      (entry) => entry.problem.difficulty === "MEDIUM",
    ).length;
    const hardSolved = useSolvedProblemCount.filter(
      (entry) => entry.problem.difficulty === "HARD",
    ).length;

    const solvedProblemCount = {
      totalSolved: useSolvedProblemCount.length,
      easySolved,
      mediumSolved,
      hardSolved,
    };

    return solvedProblemCount;
  } catch (error) {
    console.log(error)
    return `Failed to fetch solved problem count ${error.message}`;
  }
};

export { getProblemDifficultyCount, getUserSolvedProblemCount };
