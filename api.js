import express from "express";
import { generateRouter } from "./routes/generate.js";

const router = express.Router();

router.use("/generate", generateRouter);


export default router;
