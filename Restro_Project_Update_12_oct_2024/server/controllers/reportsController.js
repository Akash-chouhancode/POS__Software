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
//as discussed with filter get api done according to total sales and table no because in frontend filter is not working
const getTableBySale = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Base SQL query
    let sql = `
      SELECT 
        
        t.tableid, 
        t.tablename,
        SUM(co.totalamount) AS total_amount
      FROM rest_table t
      JOIN customer_order co ON co.table_no = t.tableid
      JOIN bill b ON b.order_id = co.order_id
      WHERE co.order_status = 4 
        AND b.bill_status = 1
    `;

    const params = [];

    // Apply date filtering only if both from and to dates are provided
    if (from && to) {
      sql += ` AND co.order_date BETWEEN ? AND ?`;
      params.push(from, to);
    }

    sql += ` GROUP BY t.tableid`;

    // Debugging SQL and params
    console.log('Final SQL:', sql);
    console.log('Params:', params);

    const results = await dbQuery(sql, params);

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching table by sale report:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the table by sale report' });
  }
};


const  salesReport = async (req, res) => {
  const { from, to, saleinvoice, payment_method_id, searchItem } = req.query;

  // Prepare the SQL query and parameters
  let params = [];

  // Base SQL query with joins for customer_info and payment_method
  let sql = `
    SELECT co.*, b.*, c.*, p.*, 
          co.saleinvoice, c.customer_name, p.payment_method, 
          b.total_amount, b.service_charge, b.VAT, b.discount, b.bill_amount,co.order_date
    FROM customer_order co
    JOIN bill b ON b.order_id = co.order_id
    LEFT JOIN customer_info c ON co.customer_id = c.customer_id AND c.is_active = 1
    LEFT JOIN payment_method p ON b.payment_method_id = p.payment_method_id
    WHERE b.bill_status = 1 AND co.order_status = 4
  `;

  // Add date filter if from and to dates are provided
  if (from && to) {
    sql += ` AND co.order_date BETWEEN ? AND ?`;
    params.push(from, to);
  }

  // Add saleinvoice condition if provided
  if (saleinvoice) {
    console.log('Adding saleinvoice filter:', saleinvoice);
    sql += ' AND co.saleinvoice = ?';
    params.push(saleinvoice);
  }

  // Add payment_method_id condition if provided
  if (payment_method_id) {
    console.log('Adding payment_method_id filter:', payment_method_id);
    sql += ' AND b.payment_method_id = ?';
    params.push(payment_method_id);
  }

  // Add searchItem condition to search by specific fields
  if (searchItem) {
    console.log('Adding searchItem filter:', searchItem);
    sql += `
      AND (
        c.customer_name LIKE ? OR 
        co.saleinvoice LIKE ? OR 
        p.payment_method LIKE ? OR 
        b.total_amount LIKE ? OR 
        b.service_charge LIKE ? OR 
        b.VAT LIKE ? OR 
        b.discount LIKE ? OR 
        b.bill_amount LIKE ?
      )
    `;
    const searchTerm = `%${searchItem}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  try {
    // console.log('Final SQL:', sql);
    console.log('Params:', params);
    sql+=` ORDER BY co.order_id DESC`

    // Execute the query
    const results = await dbQuery(sql, params);

    // Separate specific fields into a different array
    const specificFieldsArray = results.map(item => ({
      customer_name: item.customer_name,
      saleinvoice: item.saleinvoice,
      payment_method: item.payment_method,
      totalamount: item.total_amount,
      bill_amount: item.bill_amount,
      service_charge: item.service_charge,
      VAT: item.VAT,
      discount: item.discount,
      order_date:item.order_date
    }));

    // Send the response with the full results and the specific fields array
    res.status(200).json({
      success: true,
     
      data: specificFieldsArray, // Array with specific fields
    });
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the sales report' });
  }
};



const getWaiterTotalAmount = async (req, res) => {
  try {
    const { from, to, searchItem } = req.query;

    // Base SQL query
    let sql = `
      SELECT co.waiter_id, SUM(co.totalamount) AS total_amount,
      CONCAT(w.first_name, ' ', w.last_name) AS WaiterName
      FROM customer_order co
      JOIN bill b ON b.order_id = co.order_id
      LEFT JOIN employee_history w ON co.waiter_id = w.emp_his_id
      WHERE co.order_status = 4 
        AND b.bill_status = 1 
        AND co.waiter_id > 0
    `;

    const queryParams = [];

    // Add date filtering if both from and to dates are provided
    if (from && to) {
      sql += ` AND co.order_date BETWEEN ? AND ?`;
      queryParams.push(from, to);
    }

    // Group by waiter_id to get total amounts per waiter
    sql += ` GROUP BY co.waiter_id`;

    // Add the search condition if searchItem is provided
    if (searchItem) {
      const searchQuery = `%${searchItem}%`;
      sql += `
        HAVING CONCAT(WaiterName) LIKE ? 
        OR total_amount LIKE ?
      `;
      queryParams.push(searchQuery, searchQuery);
    }

    // Order by total amount in descending order
    sql += ` ORDER BY total_amount DESC`;

    // Execute the query
    const results = await dbQuery(sql, queryParams);

    // Respond with results
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error fetching total amount for waiters:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the total amount for waiters'
    });
  }
};

const serviceChargeReport = async (req, res) => {
  const { from, to, saleinvoice, searchItem } = req.query;

  // Base SQL query
  let sql = `
    SELECT b.order_id, b.service_charge
    FROM customer_order co
    JOIN bill b ON b.order_id = co.order_id
    WHERE b.bill_status = 1 
      AND co.order_status = 4
  `;

  // Parameters for the SQL query
  const params = [];

  // Add date filtering if both 'from' and 'to' are provided
  if (from && to) {
    sql += ` AND co.order_date BETWEEN ? AND ?`;
    params.push(from, to);
  }

  // Add filter for saleinvoice if it exists
  if (saleinvoice) {
    console.log('Adding saleinvoice filter:', saleinvoice);
    sql += ` AND co.saleinvoice = ?`;
    params.push(saleinvoice);
  }

  // Add search functionality for order_id and service_charge if searchItem is provided
  if (searchItem) {
    const searchTerm = `%${searchItem}%`;
    sql += `
      AND (
        b.order_id LIKE ? OR
        b.service_charge LIKE ?
      )
    `;
    params.push(searchTerm, searchTerm);
  }
  sql += ` ORDER BY co.order_id DESC`;
  
  try {
    // Debug SQL and parameters
    console.log('Final SQL:', sql);
    console.log('Params:', params);

    // Execute the query
    const results = await dbQuery(sql, params);

    // If there are results, return them
    if (results.length > 0) {
      const response = {
        alldata: results,
      };
      res.status(200).json({ success: true, data: results});
    } else {
      res.status(200).json({ success: true, data: [] }); // Return empty array if no data
    }
  } catch (err) {
    console.error('Error fetching service charge report:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the service charge report' });
  }
};
const showDataCommsion = async (req, res) => {
  const { from, to, searchItem } = req.query;

  // Base SQL query with joins to get total amount and waiter details
  let sql = `
    SELECT SUM(c.bill_amount) as totalamount, e.pos_id,
           CONCAT(e.first_name, ' ', e.last_name) as WaiterName
    FROM customer_order a
    JOIN bill c ON a.order_id = c.order_id
    LEFT JOIN employee_history e ON a.waiter_id = e.emp_his_id
    WHERE a.order_status = 4 
      AND c.bill_status = 1
  `;

  let params = [];

  // Add date filter only if start_date and end_date are provided
  if (from && to) {
    sql += ` AND a.order_date BETWEEN ? AND ? `;
    params.push(from, to);
  }

  sql += ` GROUP BY a.waiter_id `;

  // Add search functionality if searchItem is provided
  if (searchItem) {
    const searchQuery = `%${searchItem}%`;

    sql += `
      HAVING
        CONCAT(WaiterName) LIKE ?
        OR totalamount LIKE ?
    `;
    params.push(searchQuery, searchQuery);
  }

  try {
    // Execute the base query to fetch the data
    const results = await dbQuery(sql, params);

    // Iterate over each result and fetch the commission for each pos_id
    const updatedResults = await Promise.all(
      results.map(async (row) => {
        const commissionQuery = `
          SELECT rate 
          FROM payroll_commission_setting 
          WHERE pos_id = ?
        `;

        // Fetch the commission rate for the current waiter (pos_id)
        const commissionResults = await dbQuery(commissionQuery, [row.pos_id]);

        // If commission data is found, add it to the row, otherwise set to 0
        const commissionRate = commissionResults.length > 0 ? commissionResults[0].rate : 0;

        // Return the row with the added commission rate
        return {
          ...row,
          commissionRate
        };
      })
    );

    // Send the updated results (including commission) back as a response
    res.status(200).json({ success: true, data: updatedResults });
  } catch (err) {
    console.error('Error fetching commission data:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching commission data' });
  }
};

const orderCasherReport = async (req, res) => {
  const { from, to, searchItem } = req.query;

  // Base SQL query with joins to get total amount and cashier details
  let sql = `
    SELECT SUM(a.totalamount) AS totalamount,a.order_id,
           CONCAT(w.firstname, ' ', w.lastname) AS CashierName
    FROM customer_order a
    LEFT JOIN bill c ON a.order_id = c.order_id
    LEFT JOIN user w ON c.create_by = w.id
    WHERE a.order_status = 4
  `;

  const params = [];

  // Add date filtering if both from and to are provided
  if (from && to) {
    sql += ` AND a.order_date BETWEEN ? AND ?`;
    params.push(from, to);
  }

  // Add search functionality if searchItem is provided
  if (searchItem) {
    const searchQuery = `%${searchItem}%`;
    sql += ` GROUP BY c.create_by HAVING
             CONCAT(CashierName) LIKE ? OR totalamount LIKE ?`;
    params.push(searchQuery, searchQuery);
  } else {
    sql += ` GROUP BY c.create_by`;
  }

  sql+=` ORDER BY a.order_id DESC`
  try {
    // Debugging SQL and params
    console.log('Final SQL:', sql);
    console.log('Params:', params);

    // Execute the query
    const results = await dbQuery(sql, params);

    // If there are results, return them
    if (results.length > 0) {
      res.status(200).json({ success: true, data: results });
    } else {
      res.status(200).json({ success: true, data: [] }); // Return empty array if no data
    }
  } catch (err) {
    console.error('Error fetching order cashier report:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the order cashier report' });
  }
};

const salesReportFiltering = async (req, res) => {
  const { from, to, customertype, searchItem } = req.query;
  console.log(from,to)

  // Base SQL query with joins to fetch related data
  let sql = `
    SELECT co.saleinvoice, co.customer_id, co.waiter_id, co.order_date, co.cutomertype, co.order_id,
           ci.customer_name, ci.customer_email, ci.customer_phone,
           ct.customer_type,
           u.firstname AS waiter_first_name, u.lastname AS waiter_last_name,
           b.discount, b.total_amount, b.bill_status
    FROM customer_order co
    LEFT JOIN customer_info ci ON co.customer_id = ci.customer_id
    LEFT JOIN customer_type ct ON co.cutomertype = ct.customer_type_id
    LEFT JOIN user u ON co.waiter_id = u.id
    LEFT JOIN bill b ON co.order_id = b.order_id 
    WHERE co.order_status = 4 AND b.bill_status = 1
  `;

  const params = [];

  // Add date range filter if both 'from' and 'to' are provided
  if (from && to) {
    sql += ' AND co.order_date BETWEEN ? AND ?';
    params.push(from, to);
  }

  // Add customer type filter if 'customertype' is provided
  if (customertype) {
    sql += ' AND co.cutomertype = ?';
    params.push(customertype);
  }

  // Add search functionality if 'searchItem' is provided
  if (searchItem) {
    const searchTerm = `%${searchItem}%`;
    sql += `
      AND (
        ci.customer_name LIKE ? OR
        u.firstname LIKE ? OR
        u.lastname LIKE ? OR
        b.discount LIKE ? OR
        ct.customer_type LIKE ? OR
        co.saleinvoice LIKE ?
      )
    `;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  sql +=` ORDER BY co.order_id DESC`;

  try {
    // Execute the query with all filters applied
    const results = await dbQuery(sql, params);

    // Transform the results to desired format
    const detailedResults = results.map((order) => ({
      order_id: order.order_id,
      saleinvoice: order.saleinvoice,
      order_date: order.order_date,
   
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
      
      customertype: order.customer_type,
     
        waiter_id: order.waiter_id,
        first_name: order.waiter_first_name,
        last_name: order.waiter_last_name,
     
    
        discount: order.discount,
        total_amount: order.total_amount,
        bill_status: order.bill_status,
    
    }));

    res.status(200).json({ success: true, data: detailedResults });
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the sales report' });
  }
};
const salesByDate = async (req, res) => {
  const { from, to, searchItem } = req.query;

  try {
    // Base SQL query without date filtering
    let sql = `
      SELECT 
        co.order_id, 
        co.order_date, 
        om.price, 
        om.menuqty, 
        om.varientid, 
        om.menu_id,
        v.variantName AS varientName,
        i.ProductName AS foodName
      FROM customer_order co
      JOIN order_menu om ON co.order_id = om.order_id
      LEFT JOIN variant v ON om.varientid = v.variantid
      LEFT JOIN item_foods i ON om.menu_id = i.ProductsID
      LEFT JOIN bill b ON b.order_id = om.order_id
      WHERE co.order_status = 4 
        AND b.bill_status = 1
    `;

    const params = [];

    // Add date filtering only if both from and to dates are provided
    if (from && to) {
      sql += ` AND co.order_date BETWEEN ? AND ? `;
      params.push(from, to);
    }

    // Add search functionality if searchItem is provided
    if (searchItem) {
      const searchQuery = `%${searchItem}%`;
      sql += `
        AND (
          om.menuqty LIKE ? 
          OR v.variantName LIKE ? 
          OR i.ProductName LIKE ?
          OR om.price LIKE ?
        )
      `;
      params.push(searchQuery, searchQuery, searchQuery,searchQuery);
    }
    sql +=` ORDER BY co.order_id DESC`;

    // Execute the query
    const results = await dbQuery(sql, params);

    // Return the results
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching sales by date:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching sales by date' });
  }
};

const itemSalesReport = async (req, res) => {
  const { from, to, categoryid, searchItem } = req.query;
  

  try {
    // Base SQL query without date filtering or search filtering
    let sql = `
      SELECT 
        co.order_id, 
        co.order_date, 
        om.price, 
        om.menuqty, 
        om.varientid, 
        om.menu_id,
        v.variantName AS varientName,
        i.ProductName AS foodName,
        i.ProductsID
      FROM customer_order co
      JOIN order_menu om ON co.order_id = om.order_id
      LEFT JOIN variant v ON om.varientid = v.variantid
      LEFT JOIN item_foods i ON om.menu_id = i.ProductsID
      LEFT JOIN bill b ON b.order_id = om.order_id
      WHERE co.order_status = 4 
        AND b.bill_status = 1
    `;

    const params = [];

    // Add category filter if categoryid is provided
    if (categoryid) {
      sql += ` AND i.CategoryID = ?`;
      params.push(categoryid);
    }

    // Add date filtering only if both from and to dates are provided
    if (from && to) {
      sql += ` AND co.order_date BETWEEN ? AND ?`;
      params.push(from, to);
    }

    if (searchItem) {
      const searchQuery = `%${searchItem}%`;
      sql += `
        AND (
          om.menuqty LIKE ? 
          OR v.variantName LIKE ? 
          OR i.ProductName LIKE ?
          OR om.price LIKE ?
        )
      `;
      params.push(searchQuery, searchQuery, searchQuery,searchQuery);
    }
    sql +=` ORDER BY co.order_id DESC`;

    // Execute the query
    const results = await dbQuery(sql, params);

    // Return the results
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching item sales report:', err);
    res.status(500).json({ success: false, message: 'An error occurred while fetching item sales report' });
  }
};

const getCashRegister = async (req, res) => {
  try {
    const { start_date, end_date, user_id, searchItem } = req.query;

    // Base query with JOIN to include username
    let query = `
      SELECT cr.id, cr.userid, cr.opening_balance, cr.closing_balance, cr.opendate, cr.closedate, 
             cr.status, cr.openingnote, cr.closing_note,
             CONCAT(u.firstname, ' ', u.lastname) AS username
      FROM tbl_cashregister AS cr
      LEFT JOIN user AS u ON cr.userid = u.id
      WHERE cr.status = 1
    `;

    // Array to store values for parameterized query
    const queryParams = [];

    // Date range filter
    if (start_date && end_date) {
      query += ` AND cr.opendate BETWEEN ? AND ?`;
      queryParams.push(start_date, end_date);
    }

    // User ID filter
    if (user_id) {
      query += ` AND cr.userid = ?`;
      queryParams.push(user_id);
    }

    // Search item filter for balances and username
    if (searchItem) {
      query += ` AND (
        cr.opening_balance LIKE ? OR 
        cr.closing_balance LIKE ? OR 
        CONCAT(u.firstname, ' ', u.lastname) LIKE ?
      )`;
      const searchPattern = `%${searchItem}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Execute the query with parameters
    const rows = await dbQuery(query, queryParams);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching cash register data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cash register data.',
      error: error.message,
    });
  }
};

// get cash register user 

const getCashUser = async (req, res) => {
  try {
    let query = `
      SELECT cr.id, cr.userid,
             CONCAT(u.firstname, ' ', u.lastname) AS username
      FROM tbl_cashregister AS cr
      LEFT JOIN user AS u ON cr.userid = u.id
      WHERE cr.status = 1
      GROUP BY cr.userid;
    `;
    const rows = await dbQuery(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching cash register data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cash register data.',
      error: error.message,
    });
  }
};

// register viwe data
const purchaseReport = (req, res) => {
  const { start_date, end_date, searchItem } = req.query;

  // Base SQL query
  let query = `
    SELECT a.*, a.invoiceid, a.total_price, b.supid, b.supName
    FROM purchaseitem a
    LEFT JOIN supplier b ON b.supid = a.suplierID
  
    WHERE 1=1
  `;

  const queryParams = [];

  // Apply date filter if provided
  if (start_date && end_date) {
    query += ` AND a.purchasedate BETWEEN ? AND ?`;
    queryParams.push(start_date, end_date);
  }

  // Apply search filter if provided
  if (searchItem) {
    query += `
      AND (
        a.invoiceid LIKE ? OR 
        a.total_price LIKE ? OR 
        b.supName LIKE ?
      )
    `;
    const searchQuery = `%${searchItem}%`;
    queryParams.push(searchQuery, searchQuery, searchQuery);
  }

  // Add ORDER BY clause
  query += ` ORDER BY a.purchasedate DESC`;

  // Execute the query
  db.pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching purchase report:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the purchase report",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      data: results,
    });
  });
};

const getCashRegisterView = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id",id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID parameter is required.',
      });
    }

    // First query to get opendate, closedate, and userid
    const query1 = `SELECT opendate, closedate, userid FROM tbl_cashregister WHERE id = ?`;
    const [result] = await dbQuery(query1, [id]); // Await the result and destructure

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Cash register entry not found.',
      });
    }

    const { opendate, closedate, userid } = result;

    if (!opendate || !userid) {
      return res.status(404).json({
        success: false,
        message: 'Open date or user ID is missing.',
      });
    }

    const isValidDate = (date) => !isNaN(new Date(date).getTime());

    const formatDateTime = (dateTime) => {
      if (!isValidDate(dateTime)) {
        throw new Error(`Invalid date value: ${dateTime}`);
      }
      const dateObj = new Date(dateTime);
      const date = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      const time = dateObj.toTimeString().split(' ')[0]; // Extract HH:MM:SS
      return { date, time };
    };

    // Validate and format dates
    const openDateTime = formatDateTime(opendate);

    // Handle closedate; if null or invalid, set a maximum time range
    const closeDateTime = closedate && isValidDate(closedate)
      ? formatDateTime(closedate)
      : { date: openDateTime.date, time: '23:59:59' };

    // Second query to get bill data
    const query2 = `
      SELECT order_id, bill_amount 
      FROM bill 
      WHERE create_by = ? 
      AND bill_date = ? 
      AND bill_time BETWEEN ? AND ?
    `;
    const bills = await dbQuery(query2, [
      userid,
      openDateTime.date,
      openDateTime.time,
      closeDateTime.time,
    ]);

    // Send the response with the fetched data
    res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error('Error fetching cash register view:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cash register view data.',
      error: error.message,
    });
  }
};


const productwise = async (req, res) => {
  const { itemid, start_date, end_date } = req.query;

  try {
    // Base query for product report
    let productReportQuery = `
      SELECT 
        a.*, 
        SUM(a.itemquantity) AS totalqty, 
        b.ProductsID, 
        b.ProductName 
      FROM production a
      LEFT JOIN item_foods b ON b.ProductsID = a.itemid
    `;

    const queryParams = [];

    // Adding conditions dynamically
    let whereClause = "";
    if (itemid) {
      whereClause += `a.itemid = ? `;
      queryParams.push(itemid);
    }

    if (start_date && end_date) {
      whereClause += whereClause ? "AND " : "";
      whereClause += `a.saveddate BETWEEN ? AND ? `;
      queryParams.push(start_date, end_date);
    }

    if (whereClause) {
      productReportQuery += `WHERE ${whereClause} `;
    }

    productReportQuery += `GROUP BY a.itemid ORDER BY a.saveddate DESC`;

    // Fetch product data
    const productResults = await dbQuery(productReportQuery, queryParams);

    // Map results and initialize sales-related fields
    const data = productResults.map(product => ({
      ...product,
      ProductName: product.ProductName,
      In_Qnty: product.totalqty,
      Out_Qnty: 0,
      Stock: 0,
    }));

    // For each product, calculate sales data
    for (const product of data) {
      const salesQuery = `
        SELECT 
          SUM(a.menuqty) AS totalsaleqty 
        FROM order_menu a
        LEFT JOIN customer_order b ON b.order_id = a.order_id
        WHERE a.menu_id = ? AND b.order_status != 5
      `;

      const salesResults = await dbQuery(salesQuery, [product.ProductsID]);

      const totalSaleQty = salesResults[0]?.totalsaleqty || 0;
      product.Out_Qnty = totalSaleQty;
      product.Stock = product.In_Qnty - totalSaleQty;
    }

    // Return the final report
    res.status(200).json({
      success: true,
      title: "Purchase Report",
      data,
    });
  } catch (error) {
    console.error("Error generating product-wise report:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while generating the product-wise report",
    });
  }
};
const ingredientReport = async (req, res) => {
  const { start_date, end_date, pid } = req.query;

  try {
    // Base query for the main ingredient report
    let mainQuery = `
      SELECT 
        a.*, 
        SUM(a.quantity) AS totalqty, 
        b.id, 
        b.ingredient_name, 
        b.stock_qty, 
        c.uom_short_code
      FROM purchase_details a
      LEFT JOIN ingredients b ON b.id = a.indredientid
      INNER JOIN unit_of_measurement c ON c.id = b.uom_id
    `;

    const queryParams = [];
    let whereClauses = [];

    // Add conditions only if the parameters are provided
    if (pid) {
      whereClauses.push(`a.indredientid = ?`);
      queryParams.push(pid);
    }
    if (start_date && end_date) {
      whereClauses.push(`a.purchasedate BETWEEN ? AND ?`);
      queryParams.push(start_date, end_date);
    }

    if (whereClauses.length > 0) {
      mainQuery += `WHERE ${whereClauses.join(" AND ")} `;
    }

    mainQuery += `GROUP BY a.indredientid ORDER BY a.purchasedate DESC`;

    const mainResults = await dbQuery(mainQuery, queryParams);

    

    const ingredientData = mainResults;
    console.log("ingrediet",mainResults)

    // Query for sales quantity
    const salesQty = await ingredientReportById(start_date, end_date, pid);
    console.log(salesQty,"salesQty")

    // Prepare the final response
    const data = ingredientData.map((ingredientDatas) => ({
      ProductName: ingredientDatas.ingredient_name,
      In_Qnty: `${ingredientDatas.totalqty} ${ingredientDatas.uom_short_code}`,
      Out_Qnty: `${ingredientDatas.totalqty - ingredientDatas.stock_qty} ${ingredientDatas.uom_short_code}`,
      Stock: `${ingredientDatas.stock_qty} ${ingredientDatas.uom_short_code}`,
    }));
    

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating ingredient report:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while generating the ingredient report.",
    });
  }
};

const ingredientReportById = async (start_date, end_date, id) => {
  try {
    // Query for production
    let productionQuery = `
      SELECT itemid, itemquantity
      FROM production
    `;
    const queryParams = [];
    let whereClauses = [];

    if (start_date && end_date) {
      whereClauses.push(`saveddate BETWEEN ? AND ?`);
      queryParams.push(start_date, end_date);
    }

    if (whereClauses.length > 0) {
      productionQuery += `WHERE ${whereClauses.join(" AND ")}`;
    }

    const productionResults = await dbQuery(productionQuery, queryParams);

    let totalSaleQty = 0;

    for (const production of productionResults) {
      const saleQuery = `
        SELECT 
          SUM(a.qty) AS totalsaleqty 
        FROM production_details a
        WHERE a.ingredientid = ? AND a.foodid = ?
        GROUP BY a.foodid
      `;
      const saleResults = await dbQuery(saleQuery, [id, production.itemid]);
      const saleQty = saleResults[0]?.totalsaleqty || 0;

      totalSaleQty += saleQty * production.itemquantity;
    }

    return totalSaleQty;
  } catch (error) {
    console.error("Error generating sales data:", error);
    throw new Error("Failed to calculate sales quantity.");
  }
};


const orderDelivery = async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    // Base query
    let query = `
      SELECT 
        SUM(c.total_amount) AS totalamount,
        c.shipping_type 
      FROM customer_order a
      LEFT JOIN bill c ON a.order_id = c.order_id
      WHERE a.order_status = 4
    `;

    const queryParams = [];

    // Add date range condition if dates are provided
    if (start_date && end_date) {
      query += ` AND a.order_date BETWEEN ? AND ?`;
      queryParams.push(start_date, end_date);
    }

    query += ` GROUP BY c.shipping_type`;

    // Execute the query with parameters
    const results = await dbQuery(query, queryParams);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for the specified criteria.",
      });
    }

    // Send the results as the response
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching order delivery data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching order delivery data.",
    });
  }
};
module.exports={
    getTableBySale,
    salesReport,
    getWaiterTotalAmount,
    serviceChargeReport,
    showDataCommsion,
    orderCasherReport,
    salesReportFiltering,
    salesByDate,
    itemSalesReport,
    getCashRegister,
    getCashUser,
    getCashRegisterView,
    purchaseReport,
    productwise,
    ingredientReport,
    orderDelivery
}