const express = require("express");
const router = express.Router();

const expensecontroller = require("../controllers/expenseController");

router.get("/expense",expensecontroller.getExpenseIten);
router.post("/expense",expensecontroller.postExpenseIten);
router.delete("/expense/:id",expensecontroller.deleteExpenseItem);
router.get("/expense/:id",expensecontroller.getExpenseItemById);
router.put("/expense/:id",expensecontroller.updateExpenseItem);

// expense page
router.get("/expensepage",expensecontroller.getExpenses)
router.post("/expensepage",expensecontroller.createExpense)
router.delete("/expensepage/:id",expensecontroller.deleteExpense)

module.exports= router;