import { sql } from "../config/db.js";

export async function getTransactions(req, res) {
  try {
    const transactions = await sql`
    SELECT 
      id::text as id,
      user_id,
      title,
      amount::float as amount,
      category,
      type,
      date::text as date,
      description,
      created_at::text as created_at,
      updated_at::text as updated_at
    FROM transactions 
    ORDER BY created_at DESC
    `;
    
    res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.log("Error getting Transactions", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, type, date, description, user_id } = req.body;

    if (!title || !user_id || !category || amount === undefined || !type || !date) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided"
      });
    }

    const transaction = await sql`
    INSERT INTO transactions(user_id, title, amount, category, type, date, description, created_at, updated_at)
    VALUES (${user_id}, ${title}, ${amount}, ${category}, ${type}, ${date}, ${description || null}, NOW(), NOW())
    RETURNING 
      id::text as id,
      user_id,
      title,
      amount::float as amount,
      category,
      type,
      date::text as date,
      description,
      created_at::text as created_at,
      updated_at::text as updated_at
    `;
    
    res.status(201).json({
      success: true,
      data: transaction[0]
    });

  } catch (error) {
    console.log("Error creating transaction", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
} 

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { title, amount, category, type, date, description } = req.body;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction ID"
      });
    }

    const result = await sql`
    UPDATE transactions 
    SET 
      title = ${title || null},
      amount = ${amount || null},
      category = ${category || null},
      type = ${type || null},
      date = ${date || null},
      description = ${description || null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING 
      id::text as id,
      user_id,
      title,
      amount::float as amount,
      category,
      type,
      date::text as date,
      description,
      created_at::text as created_at,
      updated_at::text as updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.log("Error updating transaction", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction ID"
      });
    }
    
    const result = await sql`
    DELETE FROM transactions WHERE id = ${id} RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully"
    });

  } catch (error) {
    console.log("Error deleting transaction", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

export async function clearAllTransactions(req, res) {
  try {
    await sql`DELETE FROM transactions`;
    
    res.status(200).json({
      success: true,
      message: "All transactions cleared successfully"
    });

  } catch (error) {
    console.log("Error clearing transactions", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
} 
