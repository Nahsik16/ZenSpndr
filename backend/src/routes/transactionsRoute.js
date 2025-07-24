import express from "express";

import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  clearAllTransactions 
} from "../controllers/transactionController.js";

const router = express.Router();

// Get all transactions
router.get("/", getTransactions);

// Create a new transaction
router.post("/", createTransaction);

// Update a transaction
router.put("/:id", updateTransaction);

// Delete a transaction
router.delete("/:id", deleteTransaction);

// Clear all transactions
router.delete("/", clearAllTransactions);

export default router;
