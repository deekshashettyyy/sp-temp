
// import { evaluateAnswerWithAI } from "../services/gemini.service.js";
import { evaluateAnswerWithAI } from "../services/groq.service.js";

export const postEvaluateAnswer = async (req, res) => {
  try {
    const { question, answer, sourceFile, evidence } = req.body;

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

    const evaluation = await evaluateAnswerWithAI({
      question: question.trim(),
      answer: answer.trim(),
      sourceFile:
        typeof sourceFile === "string" ? sourceFile : undefined,
      evidence: typeof evidence === "string" ? evidence : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Answer evaluated successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Answer evaluation failed:", error.message);

    return res.status(502).json({
      success: false,
      message: "AI evaluation failed. Please try again.",
    });
  }
};
