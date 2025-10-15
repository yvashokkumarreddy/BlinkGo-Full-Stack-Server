import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentsController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// UPI Payment
router.post("/create-order", createOrder);
router.post("/verify",auth, verifyPayment);

export default router;
