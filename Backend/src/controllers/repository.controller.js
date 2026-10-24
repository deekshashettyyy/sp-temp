
import { analyzeRepository } from "../services/repository.service.js";

export const postRepositoryAnalysis = async (req, res, next) => {
  try {
    const { repositoryUrl } = req.body;

    if (
      typeof repositoryUrl !== "string" ||
      repositoryUrl.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required.",
      });
    }

    const result = await analyzeRepository(repositoryUrl.trim());

    return res.status(200).json({
      success: true,
      message: "Repository analyzed successfully.",
      data: result,
    });
  } catch (error) {
    if (error.message.startsWith("Please enter") ||
        error.message.startsWith("Only public") ||
        error.message.startsWith("Enter a repository") ||
        error.message.startsWith("The repository URL")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("not found") ||
      error.message.includes("not publicly accessible")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("rate limit") ||
      error.message.includes("access restriction")
    ) {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
