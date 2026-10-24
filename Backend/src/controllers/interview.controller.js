
import { analyzeRepository } from "../services/repository.service.js";
import { generateQuestions } from "../services/interview.service.js";

export const postStartInterview = async (req, res, next) => {
  try {
    const { repositoryUrl } = req.body;

    if (
      typeof repositoryUrl !== "string" ||
      !repositoryUrl.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required.",
      });
    }

    const result = await analyzeRepository(repositoryUrl.trim());

    const questions = generateQuestions(
      result.analysis.sourceFiles,
      5
    );

    const publicQuestions = questions.map(
      ({ id, topic, question, sourceFile, evidence }) => ({
        id,
        topic,
        question,
        sourceFile,
        evidence,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Interview started successfully.",
      data: {
        repository: result.repository,
        analysis: {
          totalFiles: result.analysis.totalFiles,
          technologies: result.analysis.technologies,
          sourceFilesRetrieved: result.analysis.sourceFiles.length,
        },
        questions: publicQuestions,
      },
    });
  } catch (error) {
    if (
      error.message.startsWith("Please enter") ||
      error.message.startsWith("Only public") ||
      error.message.startsWith("Enter a repository") ||
      error.message.startsWith("The repository URL")
    ) {
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
      error.message.includes("No source files") ||
      error.message.includes("No supported code patterns")
    ) {
      return res.status(422).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
