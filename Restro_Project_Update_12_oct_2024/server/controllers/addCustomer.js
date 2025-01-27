const db = require("../utils/db");
const fs = require("fs");
const path = require("path");

const getCustomers = async (req, res) => {
  try {
    const { SearchItem } = req.query;

    // Define the base query
    let getCustomersQuery = `
      SELECT 
        customer_id, customer_name, customer_email, customer_phone, customer_address 
      FROM 
        customer_info
    `;
    let values = [];

    // If SearchItem is provided, modify the query to filter results
    if (SearchItem) {
      getCustomersQuery += `
        WHERE 
          customer_name LIKE ? 
          OR customer_email LIKE ? 
          OR customer_phone LIKE ? 
          OR customer_address LIKE ?
      `;
      const searchValue = `%${SearchItem}%`;
      values = [searchValue, searchValue, searchValue, searchValue];
    }

    // Add ORDER BY clause at the end
    getCustomersQuery += ` ORDER BY customer_id DESC`;

    // Execute the query with or without search filtering
    db.pool.query(getCustomersQuery, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'An error occurred' });
      } else {
        return res.status(200).json({ success: true, data: result, message: "Customers fetched successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};





const createCustomer = async (req, res) => {
  try {
    console.log(req.body);
    const { customer_name, customer_email, customer_address, customer_phone } =
      req.body;

    const createCustomerQuery = `INSERT INTO customer_info (customer_name, customer_email, customer_address, customer_phone) VALUES (?, ?, ?, ?)`;
    const values = [
      customer_name,
      customer_email,
      customer_address,
      customer_phone,
    ];
    db.pool.query(createCustomerQuery, values, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Customer created successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};


const getCustomerById = async (req, res) => {
  try {
    const { customer_id } = req.params; 
    const getCustomerByIdQuery = `SELECT customer_id, customer_name, customer_email, customer_phone, customer_address FROM customer_info WHERE customer_id = ?`;

    db.pool.query(getCustomerByIdQuery, [customer_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred' });
      } else if (result.length === 0) {
        res.status(404).json({ success: false, message: 'Customer not found' });
      } else {
        res.status(200).json({ success: true, data: result[0], message: "Customer fetched successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const {
      customer_name,
      customer_email,
      customer_address,
      customer_phone
    } = req.body;

    // Fetch the current data of the customer
    const fetchCurrentDataSql = "SELECT * FROM customer_info WHERE customer_id = ?";
    db.pool.query(fetchCurrentDataSql, [customer_id], async (fetchErr, fetchData) => {
      if (fetchErr) {
        console.error("Database fetch error: ", fetchErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (fetchData.length === 0) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      const currentData = fetchData[0];

      // Merge current and new data
      const updatedData = {
        customer_name: customer_name !== undefined ? customer_name : currentData.customer_name,
        customer_email: customer_email !== undefined ? customer_email : currentData.customer_email,
        customer_address: customer_address !== undefined ? customer_address : currentData.customer_address,
        customer_phone: customer_phone !== undefined ? customer_phone : currentData.customer_phone
      };

      // Update the customer with the merged data
      const updateCustomerQuery = `UPDATE customer_info SET customer_name = ?, customer_email = ?, customer_address = ?, customer_phone = ? WHERE customer_id = ?`;
      db.pool.query(updateCustomerQuery, [
        updatedData.customer_name,
        updatedData.customer_email,
        updatedData.customer_address,
        updatedData.customer_phone,
        customer_id
      ], (err, result) => {
        if (err) {
          console.error("Database query error: ", err);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        } else if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Customer not found' });
        } else {
          return res.status(200).json({ success: true, message: "Customer updated successfully" });
        }
      });
    });
  } catch (error) {
    console.error("Update customer error: ", error);
    return res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params; 

    const deleteCustomerQuery = `DELETE FROM customer_info WHERE customer_id = ?`;
    
    db.pool.query(deleteCustomerQuery, [customer_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ success: false, message: "Customer not found" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Customer deleted successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = { getCustomers, createCustomer , deleteCustomer,getCustomerById,updateCustomer};

