
import { evaluateAnswer } from "../services/answerEvaluation.service.js";

export const postEvaluateAnswer = (req, res) => {
  const { question, answer, sourceFile } = req.body;

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({
      success: false,
      message: "Question is required.",
    });
  }

  if (typeof answer !== "string" || !answer.trim()) {
    return res.status(400).json({
      success: false,
      message: "Answer cannot be empty.",
    });
  }

  if (answer.trim().length > 10000) {
    return res.status(400).json({
      success: false,
      message: "Answer must not exceed 10,000 characters.",
    });
  }

  const evaluation = evaluateAnswer({
    question: question.trim(),
    answer: answer.trim(),
    sourceFile:
      typeof sourceFile === "string" ? sourceFile : undefined,
  });

  return res.status(200).json({
    success: true,
    message: "Answer evaluated successfully.",
    data: evaluation,
  });
};
