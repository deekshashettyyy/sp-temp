
import { Router } from "express";
import { postStartInterview } from "../controllers/interview.controller.js";

const router = Router();

router.post("/start", postStartInterview);

export default router;
