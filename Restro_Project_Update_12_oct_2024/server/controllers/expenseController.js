const db = require("../utils/db");
const dbQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.pool.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };

  const getExpenseIten = async (req, res) => {
    try {
      const { searchItem } = req.query;
      let sql;
      let queryParams = [];
  
      // Log the search item for debugging purposes
      console.log("search:", searchItem);
  
      // If searchItem is not provided or empty, fetch all expense items
      if (!searchItem || searchItem.trim() === "") {
        sql = 'SELECT * FROM expense_item';
      } else {
        // Use wildcard search for expense item names matching the searchItem
        sql = 'SELECT * FROM expense_item WHERE expense_item_name LIKE ?';
        queryParams = [`%${searchItem}%`]; // Wildcards for partial match
      }
  
      // Execute the SQL query
      const result = await dbQuery(sql, queryParams);
  
      // Check if result has any data
      if (!result || result.length === 0) {
        return res.status(404).json({ message: "No expense items found" });
      }
  
      // Return the result
      res.status(200).json({ data: result });
    } catch (err) {
      console.error('Error fetching expense items:', err);
      res.status(500).send("Server error");
    }
  };
  
const postExpenseIten=async(req,res)=>{
    const {expense_item_name}=req.body;
    const sql=`INSERT INTO expense_item (expense_item_name) VALUES(?)`;
    const result=db.pool.query(sql,expense_item_name);
    if(result){
        res.status(200).json({message:'Expense item inserted successfully'});
    }
    else{
        res.status(500).json({message:'An error occurred'})
    }
    
    
    }

const deleteExpenseItem = async (req, res) => {
    try {
      const { id } = req.params;
      const sql = `DELETE FROM expense_item WHERE id = ?`;
      await dbQuery(sql, [id]);
      res.status(200).json({ message: "Successfully Deleted" });
    } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'An error occurred' });
    }
  };
 const getExpenseItemById = async (req, res) => {
    const { id } = req.params;
    
    try {
      const sql = `SELECT * FROM expense_item WHERE id = ?`; 
      const result = await dbQuery(sql, [id]); 
  
      if (result.length > 0) {
        res.status(200).json({ data: result[0] }); 
      } else {
        res.status(404).json({ message: 'Expense item not found' });
      }
    } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  const updateExpenseItem = async (req, res) => {
    const { id } = req.params; 
    const { expense_item_name } = req.body;
  
    const sql = `UPDATE expense_item SET expense_item_name = ? WHERE id = ?`; 
    const result = await dbQuery(sql, [expense_item_name, id]); 
  
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Expense item updated successfully' });
    } else {
      res.status(404).json({ message: 'Expense item not found or no changes made' });
    }
  };

// add expense page

const getExpenses = async (req, res) => {
  const { seachItem } = req.query;
  let sql = `
    SELECT e.*, ei.expense_item_name, e.amount, e.date
    FROM expense e
    LEFT JOIN expense_item ei ON ei.id = e.type
  `;

  if (seachItem) {
    sql += ` WHERE ei.expense_item_name LIKE ? OR e.amount LIKE ? OR e.date LIKE ? `;
  }

  sql += ` ORDER BY e.id DESC`;

  try {
    const params = seachItem ? [`%${seachItem}%`, `%${seachItem}%`, `%${seachItem}%`] : [];
    const results = await dbQuery(sql, params);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the expenses' });
  }
};        

  const createExpense = async (req, res) => {
    const { VDate, type, paytype, amount, bankid } = req.body;
    const voucher_no = new Date().toISOString().replace(/[-T:.Z]/g, '');
    const CreateBy = req.id;
    const createdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const Vtype = 'Expense'; // Define Vtype (assuming it's an expense type identifier)
  
    const sql = `
      INSERT INTO expense (date, type, voucher_no, amount)
      VALUES (?, ?, ?, ?)
    `;
  
    try {
      const result = await dbQuery(sql, [VDate, type, voucher_no, amount]);
  
      if (paytype === 1) {
        // Insert into acc_transaction for cash in hand
        const cashInHandQuery = `
          INSERT INTO acc_transaction (VNo, Vtype, VDate, COAID, Narration, Debit, Credit, IsPosted, CreateBy, CreateDate, IsAppove) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const cashInHandParams = [
          voucher_no, Vtype, VDate, '1020101', `${type} Expense ${voucher_no}`,
          0, amount, 1, CreateBy, createdate, 1
        ];
        await dbQuery(cashInHandQuery, cashInHandParams);
      } else {
        // Insert into bank_summary
        const bankSummaryQuery = `
          INSERT INTO bank_summary (date, ac_type, bank_id, description, deposite_id, dr, cr, ammount, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const bankSummaryParams = [
          VDate, 'Credit (-)', bankid, `${type} Expense`, voucher_no, null, amount, amount, 1
        ];
        await dbQuery(bankSummaryQuery, bankSummaryParams);
      }
  
      res.status(201).json({ success: true, message: 'Expense created successfully', data: result });
    } catch (err) {
      console.error('Error creating expense:', err);
      res.status(500).json({ success: false, message: 'An error occurred while creating the expense' });
    }
  };
const deleteExpense = async (req, res) => {
  const voucher_no  = req.params.id; 

  // SQL query to delete an expense
  const sql = `
    DELETE FROM expense WHERE voucher_no = ?
  `;

  try {
    // Execute the delete query
    const result = await dbQuery(sql, [voucher_no]);

    if (result.affectedRows === 0) {
      // If no rows were affected, the voucher_no might not exist
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Optionally, you can also delete related transactions from acc_transaction and bank_summary
    await dbQuery(`DELETE FROM acc_transaction WHERE VNo = ?`, [voucher_no]);
    await dbQuery(`DELETE FROM bank_summary WHERE deposite_id = ?`, [voucher_no]);

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the expense' });
  }
};
  module.exports={
    getExpenseIten,
    postExpenseIten,
    deleteExpenseItem,
    getExpenseItemById,
    updateExpenseItem,
    getExpenses,
    createExpense,
    deleteExpense
  }