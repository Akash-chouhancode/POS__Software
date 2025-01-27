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
const getAllShippingMethods = async (req, res) => {
    try {
      const query = 'SELECT * FROM shipping_method';
      db.pool.query(query, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Failed to fetch shipping methods' });
        } else {
          res.status(200).json({ success: true, data: results });
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An unexpected error occurred' });
    }
  };


 const  createShippingMethod = async (req, res) => {
    try {
      const { shipping_method, shippingrate, payment_method, is_active, shiptype } = req.body;
      const query = `INSERT INTO shipping_method (shipping_method, shippingrate, is_active) 
                     VALUES (?, ?, ?)`;
      db.pool.query(query, [shipping_method, shippingrate, is_active], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Failed to create shipping method' });
        } else {
          res.status(200).json({ success: true, message: 'Shipping method created successfully', id: result.insertId });
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An unexpected error occurred' });
    }
  };

  const deleteShippingMethod = async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM shipping_method WHERE ship_id = ?';
      db.pool.query(query, [id], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Failed to delete shipping method' });
        } else {
          res.status(200).json({ success: true, message: 'Shipping method deleted successfully' });
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An unexpected error occurred' });
    }
  };
const getShippingMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM shipping_method WHERE ship_id = ?';
    db.pool.query(query, [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch shipping method' });
      } else if (results.length === 0) {
        res.status(404).json({ success: false, message: 'Shipping method not found' });
      } else {
        res.status(200).json({ success: true, data: results[0] });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

const updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_method, shippingrate, is_active } = req.body;
    const query = `UPDATE shipping_method 
                   SET shipping_method = ?, shippingrate = ?, is_active = ?
                   WHERE ship_id = ?`;
    db.pool.query(query, [shipping_method, shippingrate,  is_active,  id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update shipping method' });
      } else {
        res.status(200).json({ success: true, message: 'Shipping method updated successfully' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};
  module.exports={
    getAllShippingMethods,
    createShippingMethod,
    deleteShippingMethod,
    getShippingMethodById,
    updateShippingMethod
  } 