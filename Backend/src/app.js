
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.route.js";
import repositoryRoutes from "./routes/repository.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import interviewRoutes from "./routes/interview.route.js";
import answerRoutes from "./routes/answer.route.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SkillProof API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/answers", answerRoutes);


app.use(errorHandler);

export default app;

