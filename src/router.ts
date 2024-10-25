import { Router } from "express";
import { createPDF } from "./utils/pdf/createPDF";

export const router = Router();
router.post("/pdf", createPDF);
