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

  const showsplitorder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      // Validate orderId
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
  
      // Fetch order information
      const orderQuery = `SELECT * FROM customer_order WHERE order_id = ?`;
      db.pool.query(orderQuery, [orderId], (err, orderResult) => {
        if (err) {
          console.error("Error fetching order information:", err);
          return res.status(500).json({ message: "Error fetching order information" });
        }
  
        if (!orderResult || orderResult.length === 0) {
          return res.status(404).json({ message: "Order not found" });
        }
  
        // Fetch order menu items
        const getOrderMenuQuery = `
          SELECT
              om.*,
              f.*,
              v.variantName,
              GROUP_CONCAT(a.add_on_id) AS add_on_ids,
              GROUP_CONCAT(a.add_on_name) AS add_on_names,
              GROUP_CONCAT(a.price) AS add_on_prices
          FROM
              order_menu om
              LEFT JOIN add_ons a ON FIND_IN_SET(a.add_on_id, om.add_on_id)
              LEFT JOIN item_foods f ON om.menu_id = f.ProductsID
              LEFT JOIN variant v ON om.varientid = v.variantid
          WHERE
              om.order_id = ?
          GROUP BY om.menu_id, om.varientid;
        `;
  
        db.pool.query(getOrderMenuQuery, [orderId], (err, menuResult) => {
          if (err) {
            console.error("Error fetching menu items:", err);
            return res.status(500).json({
              success: false,
              message: "An error occurred while fetching menu items",
            });
          }
  
          // Process menuResult to structure add-on data
          const structuredMenuItems = menuResult.map((item) => {
            const addOnIds = item.add_on_ids ? item.add_on_ids.split(",") : [];
            const addOnNames = item.add_on_names ? item.add_on_names.split(",") : [];
            const addOnPrices = item.add_on_prices ? item.add_on_prices.split(",") : [];
            const addOnQuantities = item.addonsqty ? item.addonsqty.split(",") : [];
  
            const addOns = addOnIds.map((id, index) => ({
              add_on_id: id,
              add_on_name: addOnNames[index] || null,
              add_on_price: addOnPrices[index] || null,
              add_on_quantity: addOnQuantities[index] || null,
            }));
  
            return {
              ...item,
              add_ons: addOns,
            };
          });
  
          // Send response
          res.status(200).json({
            order: orderResult[0],
            menuItems: structuredMenuItems,
            message: "Split order data fetched successfully",
          });
        });
      });
    } catch (error) {
      console.error("Error in showsplitorder:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  // merge order api

  const mergeMakePayment = (req, res) => {
    const orderIds = req.body.orderid;
  
    // Validate order IDs
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "Invalid order IDs" });
    }
    
    console.log("Order IDs:", orderIds);
  
    const allOrder = orderIds.join(",");
    const { payment_method_id, paidAmount, discount } = req.body;
  
    console.log("Request Body:", req.body);
  
    // Check if orders exist in customer_order table
    const checkOrderQuery = "SELECT * FROM customer_order WHERE order_id IN (?)";
    db.pool.query(checkOrderQuery, [orderIds], (err, orderResult) => {
      if (err) {
        console.error("Error checking customer_order:", err);
        return res.status(500).json({ success: false, message: "An error occurred" });
      }
  
      if (orderResult.length === 0) {
        console.log("Order not found for order IDs:", orderIds);
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      // Update customer_order table
      const updateOrderQuery = `
        UPDATE customer_order 
        SET marge_order_id = ?, customerpaid = ?, order_status = 4 
        WHERE order_id IN (?)
      `;
      db.pool.query(updateOrderQuery, [allOrder, paidAmount, orderIds], (err, updateOrderResult) => {
        if (err) {
          console.error("Error updating customer_order:", err);
          return res.status(500).json({ success: false, message: "An error occurred" });
        }
  
        if (updateOrderResult.affectedRows === 0) {
          console.log("No rows updated in customer_order for order IDs:", orderIds);
          return res.status(404).json({ success: false, message: "No rows updated in customer_order" });
        }
  
        // If table_no is not 0, update rest_table
        const tableNos = orderResult
          .map((order) => order.table_no)
          .filter((table_no) => table_no !== 0);
  
        if (tableNos.length > 0) {
          const updateTableQuery = `
            UPDATE rest_table 
            SET status = 0 
            WHERE tableid IN (?)
          `;
          db.pool.query(updateTableQuery, [tableNos], (err, updateTableResult) => {
            if (err) {
              console.error("Error updating rest_table:", err);
              return res.status(500).json({ success: false, message: "An error occurred" });
            }
  
            if (updateTableResult.affectedRows === 0) {
              console.log("No rows updated in rest_table for table IDs:", tableNos);
            }
          });
        }
  
        // Update bill table
        const updateBillQuery = `
          UPDATE bill
          SET
            payment_method_id = ?,
            bill_date = NOW(),
            bill_time = CURTIME(),
            discount = ?,      
            bill_amount = ?,
            bill_status = 1
          WHERE order_id IN (?)
        `;
        db.pool.query(updateBillQuery, [payment_method_id, discount, paidAmount, orderIds], (err, updateBillResult) => {
          if (err) {
            console.error("Error updating bill:", err);
            return res.status(500).json({ success: false, message: "An error occurred" });
          }
  
          if (updateBillResult.affectedRows === 0) {
            console.log("No rows updated in bill for order IDs:", orderIds);
            return res.status(404).json({ success: false, message: "No rows updated in bill" });
          }
  
          // Log SQL warnings (if any)
          db.pool.query("SHOW WARNINGS", (err, warnings) => {
            if (err) {
              console.error("Error showing warnings:", err);
            } else {
              console.log("SQL Warnings:", warnings);
            }
          });
  
          res.status(200).json({ success: true, message: "Payment done successfully" });
        });
      });
    });
  };

  module.exports={
    showsplitorder,
    mergeMakePayment
  }