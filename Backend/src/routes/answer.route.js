
import { Router } from "express";
import { postEvaluateAnswer } from "../controllers/answer.controller.js";

const router = Router();

router.post("/evaluate", postEvaluateAnswer);

export default router;
