const db = require("../utils/db");

const dbQuery = (query, values) => {
    return new Promise((resolve, reject) => {
      db.pool.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  };


  const createLoyaltyPoint = (req, res) => {
    const { amount, earn_point,status } = req.body;
  
    if (!amount || !earn_point) {
      return res.status(400).json({ success: false, message: "Amount and Earn Point are required" });
    }
  
    const query = "INSERT INTO loyality_point_setting (amount, earn_point,status) VALUES (?, ?,?)";
    db.pool.query(query, [amount, earn_point,status], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
      }
      res.status(201).json({ success: true, message: "Loyalty point setting created successfully" });
    });
  };
  
  // Get all loyalty point settings or search by criteria
  const getLoyaltyPoints = (req, res) => {
    const { search } = req.query;
    let query = "SELECT * FROM loyality_point_setting";
    let params = [];
  
    if (search) {
      query += " WHERE amount LIKE ? OR earn_point LIKE ?";
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm];
    }
  
    db.pool.query(query, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
      }
      res.status(200).json({ success: true, data: results });
    });
  };

  const deleteLoyaltyPoint = (req, res) => {
    const { id } = req.params;
  
    const query = "DELETE FROM loyality_point_setting WHERE id = ?";
    db.pool.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Loyalty point setting not found" });
      }
  
      res.status(200).json({ success: true, message: "Loyalty point setting deleted successfully" });
    });
  };
  const getLoyaltyPointById = (req, res) => {
    const { id } = req.params;
  
    const query = "SELECT * FROM loyality_point_setting WHERE id = ?";
    db.pool.query(query, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Loyalty point setting not found" });
      }
  
      res.status(200).json({ success: true, data: results[0] });
    });
  };

  const updateLoyaltyPoint = (req, res) => {
    const { id } = req.params;
    const { amount, earn_point,status } = req.body;
  
    const query = "UPDATE loyality_point_setting SET amount = ?, earn_point = ?,status = ? WHERE id = ?";
    db.pool.query(query, [amount, earn_point,status, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred" });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Loyalty point setting not found" });
      }
  
      res.status(200).json({ success: true, message: "Loyalty point setting updated successfully" });
    });
  };

  const getCustomerBillDetails = async (req, res) => {
    console.log("API hit: getCustomerBillDetails");
  
    const { search } = req.query; // Extract search query parameter
  
    try {
      // Query to fetch loyalty point settings
      const query1 = `SELECT * FROM loyality_point_setting WHERE status = 1`;
  
      db.pool.query(query1, (error, loyaltyResults) => {
        if (error) {
          console.error("Database query failed:", error);
          return res.status(500).json({ message: "Database query failed", error });
        }
  
        if (loyaltyResults.length === 0) {
          return res.status(404).json({ message: "No loyalty point settings found" });
        }
  
        const { amount, earn_point } = loyaltyResults[0];
  
        // Base query for fetching customer bill details
        let query2 = `
          SELECT 
              b.customer_id,
              ci.customer_name,
              SUM(b.bill_amount) AS total_bill_amount,
              FLOOR(SUM(b.bill_amount) / ?) * ? AS earning_points
          FROM bill b
          LEFT JOIN customer_info ci ON ci.customer_id = b.customer_id
          GROUP BY b.customer_id, ci.customer_name
        `;
        const params = [amount, earn_point];
  
        // Add search condition if `search` parameter is provided
        if (search) {
          query2 += `
            HAVING ci.customer_name LIKE ?
            OR b.customer_id LIKE ?
            OR total_bill_amount LIKE ?
            OR earning_points LIKE ?
          `;
          const searchTerm = `%${search}%`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
  
        // Execute the customer bill details query
        db.pool.query(query2, params, (error, customerResults) => {
          if (error) {
            console.error("Database query failed:", error);
            return res.status(500).json({ message: "Database query failed", error });
          }
  
          res.status(200).json({ data: customerResults });
        });
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ message: "Server error", error: err.message || err });
    }
  };
  module.exports={
    createLoyaltyPoint,
    getLoyaltyPoints,
    deleteLoyaltyPoint,
    getLoyaltyPointById,
    updateLoyaltyPoint,
    getCustomerBillDetails
  }