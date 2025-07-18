import express from "express";

import { getTransactionById,getTransactionSummary,createTransaction,deleteTransaction } from "../controllers/transactionController.js";
const router = express.Router();
router.get("/:userId", getTransactionById);

router.post("/", createTransaction);

router.delete("/:id",deleteTransaction)

router.get("/summary/:userId",getTransactionSummary)

export default router;
