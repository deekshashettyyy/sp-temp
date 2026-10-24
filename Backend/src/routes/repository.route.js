
import { Router } from "express";
import { postRepositoryAnalysis } from "../controllers/repository.controller.js";

const router = Router();

router.post("/analyze", postRepositoryAnalysis);

export default router;
