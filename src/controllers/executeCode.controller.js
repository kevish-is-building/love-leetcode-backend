import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const executeCode = async (req, res) => {
  const { code, language_id, stdin, expected_outputs, id, title } = req.body;

  const userId = req.user.id;
  let source_code = code;

  if (
    !Array.isArray(stdin) ||
    !Array.isArray(expected_outputs) ||
    stdin.length === 0 ||
    expected_outputs.length !== stdin.length
  ) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid or Missing test cases"));
  }

  if (!language_id) {
    return res.status(400).json(new ApiError(400, `Language not supported`));
  }

  try {
    const submissionBatch = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    const batchResponse = await submitBatch(submissionBatch);
    const batchTokens = batchResponse.map((res) => res.token);
    const batchResults = await pollBatchResults(batchTokens);

    // Checking Answers on all testcases
    let isAccepted = true;
    const finalResults = batchResults.map((testcase, idx) => {
      const stdout = testcase.stdout?.trim();
      const expected_output = expected_outputs[idx]?.trim();
      const isTestPassed = stdout === expected_output;

      if (!isTestPassed) isAccepted = false;

      return {
        testCaseNumber: idx + 1,
        isTestPassed,
        stdout,
        expected_output,
        stderr: testcase.stderr || null,
        compile_output: testcase.compile_output || null,
        status: testcase.status.description,
        memory: testcase.memory ? testcase.memory : undefined,
        time: testcase.time ? testcase.time : undefined,
      };
    });

    // Storing to the submission summary
    const submission = await db.submission.create({
      data: {
        userId,
        problemId: id,
        problemTitle: title,
        language: getLanguageName(language_id),
        sourceCode: source_code,
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(finalResults.map((r) => r.stdout)),
        stderr: finalResults.some((r) => r.stderr)
          ? JSON.stringify(finalResults.map((r) => r.stderr))
          : null,
        compileOutput: finalResults.some((r) => r.compile_output)
          ? JSON.stringify(finalResults.map((r) => r.compile_output))
          : "",
        status: isAccepted ? "Accepted" : "Wrong Answer",
        memory: finalResults.some((r) => r.memory)
          ? JSON.stringify(finalResults.map((r) => String(r.memory)))
          : "",
        time: finalResults.some((r) => r.time)
          ? JSON.stringify(finalResults.map((r) => String(r.time)))
          : "",
      },
    });

    // if all answers are correct then add it to problem solved for the user
    if (isAccepted) {
      await db.ProblemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId: id,
          },
        },
        update: {},
        create: {
          userId,
          problemId: id,
          language: getLanguageName(language_id),
        },
      });
    }

    // Creating testcase result to db
    const testCaseResults = finalResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCaseNumber,
      passed: result.isTestPassed,
      stdout: result.stdout,
      expected: result.expected_output,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: String(result.memory),
      time: String(result.time),
    }));

    await db.TestCasesResult.createMany({
      data: testCaseResults,
    });

    res.status(200).json(new ApiResponse(200, "Code executed", finalResults));
  } catch (error) {
    console.log("Error while executing code:", error);
    res.status(500).json(new ApiError(500, "Error while executing code"));
  }
};

const runCode = async (req, res) => {
  const { code, language_id, stdin, expected_outputs } = req.body;
  let source_code = code;

  if (!source_code || !language_id || !stdin || !expected_outputs) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          `Missing required fields ${!source_code ? "source_code " : ""}${
            !language_id ? "language_id " : ""
          }${!stdin ? "stdin " : ""}${
            !expected_outputs ? "expected_outputs" : ""
          }`,
        ),
      );
  }

  if (typeof source_code !== "string") {
    return res
      .status(400)
      .json(new ApiError(400, "source_code should be a string"));
  }

  if (typeof language_id !== "number") {
    return res
      .status(400)
      .json(new ApiError(400, "language_id should be a number"));
  }

  if (
    !Array.isArray(stdin) ||
    !Array.isArray(expected_outputs) ||
    stdin.length === 0 ||
    expected_outputs.length !== stdin.length
  ) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid or Missing test cases"));
  }

  const submissionBatch = stdin.map((input, index) => ({
    source_code,
    language_id,
    stdin: input,
  }));
  try {
    
    const batchResponse = await submitBatch(submissionBatch);
    const batchTokens = batchResponse.map((res) => res.token);
    const batchResults = await pollBatchResults(batchTokens);
  
    // Checking Answers on all testcases
    let isAccepted = true;
  
    const finalResults = batchResults.map((testcase, idx) => {
      const stdout = testcase.stdout?.trim();
      const expected_output = expected_outputs[idx]?.trim();
      const isTestPassed = stdout === expected_output;
  
      if (!isTestPassed) isAccepted = false;
  
      return {
        testCaseNumber: idx + 1,
        isTestPassed,
        stdout,
        expected_output,
        stderr: testcase.stderr || null,
        compile_output: testcase.compile_output || null,
        status: testcase.status.description,
        memory: testcase.memory ? testcase.memory : undefined,
        time: testcase.time ? testcase.time : undefined,
      };
    });
  
    res.status(200).json(new ApiResponse(200, "Code executed", finalResults));
  
  } catch (error) {
    console.log("Error while running code:", error);
    res.status(500).json(new ApiError(500, "Error while running code"));
  }
};

export { executeCode, runCode };
