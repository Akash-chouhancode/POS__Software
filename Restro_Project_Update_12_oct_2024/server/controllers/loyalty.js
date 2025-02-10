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


  const dueMergePayment = (req, res) => {
    const { orderid, payment_method_id, paidAmount, discount } = req.body;
  
    // Validate order IDs
    if (!orderid || !Array.isArray(orderid) || orderid.length === 0) {
      return res.status(400).json({ message: "Invalid order IDs" });
    }
  
    console.log("Order IDs:", orderid);
  
    const allOrder = orderid.join(",");
  
    console.log("Request Body:", req.body);
  
    // Check if orders exist in customer_order table
    const checkOrderQuery = "SELECT * FROM customer_order WHERE order_id IN (?)";
    db.pool.query(checkOrderQuery, [orderid], (err, orderResult) => {
      if (err) {
        console.error("Error checking customer_order:", err);
        return res.status(500).json({ success: false, message: "An error occurred while checking orders" });
      }
  
      if (orderResult.length === 0) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      // Update customer_order table
      const updateOrderQuery = `
        UPDATE customer_order 
        SET marge_order_id = ?, customerpaid = ?, order_status = 2 
        WHERE order_id IN (?)
      `;
      db.pool.query(updateOrderQuery, [allOrder, paidAmount, orderid], (err, updateOrderResult) => {
        if (err) {
          console.error("Error updating customer_order:", err);
          return res.status(500).json({ success: false, message: "An error occurred while updating customer orders" });
        }
  
        if (updateOrderResult.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "No rows updated in customer_order" });
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
            bill_status = 0
          WHERE order_id IN (?)
        `;
        db.pool.query(updateBillQuery, [payment_method_id, discount, paidAmount, orderid], (err, updateBillResult) => {
          if (err) {
            console.error("Error updating bill:", err);
            return res.status(500).json({ success: false, message: "An error occurred while updating bill" });
          }
  
          if (updateBillResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No rows updated in bill" });
          }
          const data={ ismerge: 1,
            duemerge: 0,}
  
          res.status(200).json({ success: true, message: "due mergerd" ,data:data});
        });
      });
    });
  };


  const getOngoingOrderDueMerge = async (req, res) => {
    try {
      const getOnGoingOrdersQuery = `
        SELECT
          co.*,
          c.customer_name,
          w.firstname AS waiter_first_name,
          w.lastname AS waiter_last_name,
          rt.tablename,
          b.discount,
          b.service_charge,
          b.shipping_type,
          b.VAT,
          b.bill_amount,
          b.bill_date,
          b.bill_status,
          b.payment_method_id,
          sm.shipping_method AS shipping_method_name
        FROM
          customer_order co
        LEFT JOIN
          customer_info c ON co.customer_id = c.customer_id
        LEFT JOIN
          user w ON co.waiter_id = w.id
        LEFT JOIN
          rest_table rt ON co.table_no = rt.tableid
        LEFT JOIN
          bill b ON co.order_id = b.order_id
        LEFT JOIN
          shipping_method sm ON b.shipping_type = sm.ship_id
        WHERE
          co.orderacceptreject = 1
          AND co.order_status = 2
          AND b.bill_status = 0
          AND co.marge_order_id IS NULL 
        ORDER BY
          co.order_id DESC;
      `;
  
      db.pool.query(getOnGoingOrdersQuery, (err, nonMergedOrders) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, message: "An error occurred" });
        }
  
        const getOnGoingOrdersQuery2 = `
          SELECT
            GROUP_CONCAT(DISTINCT co.marge_order_id ORDER BY co.marge_order_id ASC) AS marge_order_id,
            MAX(c.customer_name) AS customer_name,
            MAX(w.firstname) AS waiter_first_name,
            MAX(w.lastname) AS waiter_last_name,
            MAX(rt.tablename) AS tablename,
            MAX(b.discount) AS discount,
            MAX(b.service_charge) AS service_charge,
            MAX(b.shipping_type) AS shipping_type,
            MAX(b.VAT) AS VAT,
            MAX(b.bill_amount) AS bill_amount,
            MAX(b.bill_date) AS bill_date,
            MAX(b.bill_status) AS bill_status,
            MAX(b.payment_method_id) AS payment_method_id,
            MAX(sm.shipping_method) AS shipping_method_name
          FROM
            customer_order co
          LEFT JOIN
            customer_info c ON co.customer_id = c.customer_id
          LEFT JOIN
            user w ON co.waiter_id = w.id
          LEFT JOIN
            rest_table rt ON co.table_no = rt.tableid
          LEFT JOIN
            bill b ON co.order_id = b.order_id
          LEFT JOIN
            shipping_method sm ON b.shipping_type = sm.ship_id
          WHERE
            co.orderacceptreject = 1
            AND co.order_status = 2
            AND b.bill_status = 0
            AND co.marge_order_id IS NOT NULL 
          GROUP BY co.marge_order_id
          ORDER BY co.marge_order_id DESC;
        `;
  
        db.pool.query(getOnGoingOrdersQuery2, (err, mergedOrders) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "An error occurred" });
          }
  
          res.status(200).json({
            success: true,
            NonMergedOrder: nonMergedOrders,
            MergeOrder: mergedOrders,
            message: "Ongoing Orders fetched successfully",
          });
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };


  const getOrderByIdsDUeMerge = async (req, res) => {
    const order_ids = req.params.orderid; 
  
    if (!order_ids) {
      return res.status(400).json({ message: "Order IDs are required" });
    }
  
    try {
      // Convert `order_ids` into an array
      const orderIdsArray = order_ids.split(",").map(id => id.trim());
  
      // Query to fetch order details for multiple order_ids
      const getOrderDetailsQuery = `
        SELECT
          co.*,
          c.customer_name,
          c.customer_email,
          c.customer_address,
          c.customer_phone,
          w.firstname AS waiter_first_name,
          w.lastname AS waiter_last_name,
          b.discount,
          b.service_charge,
          b.shipping_type,
          b.VAT,
          b.bill_id,
          b.bill_amount,
          b.bill_date,
          b.bill_status,
          b.payment_method_id,
          sm.shipping_method AS shipping_method_name,
          CASE co.order_status
            WHEN 1 THEN 'Pending'
            WHEN 2 THEN 'Processing'
            WHEN 3 THEN 'Ready'
            WHEN 4 THEN 'Served'
            WHEN 5 THEN 'Cancel'
            WHEN 6 THEN 'Hold'
          END AS order_status_name
        FROM
          customer_order co
        LEFT JOIN customer_info c ON co.customer_id = c.customer_id
        LEFT JOIN user w ON co.waiter_id = w.id
        LEFT JOIN bill b ON co.order_id = b.order_id
        LEFT JOIN shipping_method sm ON b.shipping_type = sm.ship_id
        WHERE
          co.order_id IN (${orderIdsArray.map(() => "?").join(",")});
      `;
  
      // Query to fetch menu items for multiple order_ids
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
          om.order_id IN (${orderIdsArray.map(() => "?").join(",")})
        GROUP BY om.menu_id, om.varientid, om.order_id;
      `;
  
      // Fetch order details
      db.pool.query(getOrderDetailsQuery, [...orderIdsArray], (err, orderResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while fetching order details",
          });
        }
  
        // Fetch menu items
        db.pool.query(getOrderMenuQuery, [...orderIdsArray], (err, menuResults) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              message: "An error occurred while fetching menu items",
            });
          }
  
          // Process menu results to structure add-on data
          const structuredMenuItems = menuResults.map((item) => {
            const addOnIds = item.add_on_ids ? item.add_on_ids.split(",") : [];
            const addOnNames = item.add_on_names
              ? item.add_on_names.split(",")
              : [];
            const addOnPrices = item.add_on_prices
              ? item.add_on_prices.split(",")
              : [];
            const addOnQuantities = item.addonsqty
              ? item.addonsqty.split(",")
              : [];
  
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
  
          res.status(200).json({
            success: true,
            orderDetails: orderResults,
          
            menuItems: structuredMenuItems,
          });
        });
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "An error occurred while processing the request" });
    }
  };



  const cancelAllTypeOrder = (req, res) => {
    const  order_ids  = req.params.order_id; // Expecting multiple IDs as comma-separated values
    const { anyreason } = req.body;
    if (!order_ids || !anyreason) {
      return res.status(400).json({
  
        
        success: false,
        message: "Missing order_ids or cancellation reason",
      });
    }
  
    // Convert order_ids into an array
    const orderIdsArray = order_ids.split(",").map(id => id.trim());
  
    // Step 1: Get table_no based on order_ids
    const getTableQuery = `SELECT DISTINCT table_no FROM customer_order WHERE order_id IN (?)`;
    db.pool.query(getTableQuery, [orderIdsArray], (err, result) => {
      if (err) {
        console.error("Error fetching table_no:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching the table number",
        });
      }
  
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found with the provided order_ids",
        });
      }
  
      const tableIds = result.map(row => row.table_no); // Extract table_no values
  
      // Step 2: Update table status for affected tables
      const updateTableQuery = `UPDATE rest_table SET status = 0 WHERE tableid IN (?)`;
      db.pool.query(updateTableQuery, [tableIds], (err) => {
        if (err) {
          console.error("Error updating table status:", err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while updating the table status",
          });
        }
  
        // Step 3: Update order status and cancellation reason
        const updateOrderQuery = `
          UPDATE customer_order 
          SET order_status = 5, anyreason = ?
          WHERE order_id IN (?)`;
  
        db.pool.query(updateOrderQuery, [anyreason, orderIdsArray], (err, result) => {
          if (err) {
            console.error("Error updating customer_order:", err);
            return res.status(500).json({
              success: false,
              message: "An error occurred while updating the orders",
            });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "No orders found with the provided order_ids",
            });
          }
  
          // Success response
          res.status(200).json({
            success: true,
            message: "Orders canceled successfully",
          });
        });
      });
    });
  };


  const postsplitorder = async (req, res) => {
    const { order_id, customer_id, total_price, order_menu } = req.body;
  
    if (!order_id || !customer_id || !total_price || !Array.isArray(order_menu) || order_menu.length === 0) {
      return res.status(400).json({ message: "Required fields are missing or invalid order_menu data" });
    }
  
    try {
      let orderDetailsData = order_menu.map((menu) => {
        const addons = Array.isArray(menu.addons) ? menu.addons : [];
        const addOnIds = addons.map((addon) => addon.addons_id || "").join(",");
        const addOnQuantities = addons.map((addon) => addon.addonsqty || 0).join(",");
  
        return [
          order_id,
          customer_id,
          menu.productvat || 0,
          menu.discount || 0,
          menu.s_charge || 0,
          menu.menuqty*parseFloat(menu.price) ,
          // menu.total_price || 0,
          0, // Default status: unpaid
          menu.menu_id || null, // Ensure a valid menu ID
          addOnIds || null,
          addOnQuantities || null,
          0, // Default invoiceprint value
        ];
      });
  
      const insertQuery = `
        INSERT INTO sub_order 
        (order_id, customer_id, vat, discount, s_charge, total_price, status, order_menu_id, adons_id, adons_qty, invoiceprint)
        VALUES ?`;
  
      db.pool.query(insertQuery, [orderDetailsData], (err, result) => {
        if (err) {
          console.error("Error inserting sub order:", err);
          return res.status(500).json({ message: "Internal server error", error: err });
        }
  
        // Get the inserted `sub_id` values
        const firstInsertedId = result.insertId;
        const insertedIds = Array.from({ length: result.affectedRows }, (_, i) => firstInsertedId + i);
  
        res.status(201).json({ 
          message: "Sub order(s) created successfully", 
         
          sub_order_ids: insertedIds 
        });
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "Unexpected error occurred", error: error.message });
    }
  };
  module.exports={
    createLoyaltyPoint,
    getLoyaltyPoints,
    deleteLoyaltyPoint,
    getLoyaltyPointById,
    updateLoyaltyPoint,
    getCustomerBillDetails,
    dueMergePayment,
    getOngoingOrderDueMerge,
    getOrderByIdsDUeMerge,
    cancelAllTypeOrder,
    postsplitorder
  }