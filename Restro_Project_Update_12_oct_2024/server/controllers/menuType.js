const db = require("../utils/db");

// POST request to create a new menu type
const createMenuType = async (req, res) => {
  try {
    const { menutype, status } = req.body;
    const menu_icon = req.file ? req.file.filename : null;

    // Validate request body
    if (!menutype) {
      return res
        .status(400)
        .json({ success: false, message: "Menu type is required" });
    }

    const createMenuTypeQuery = `
      INSERT INTO tbl_menutype (menutype, menu_icon, status)
      VALUES (?, ?, ?)
    `;
    const values = [menutype, menu_icon, status];

    db.pool.query(createMenuTypeQuery, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).json({
          success: false,
          message: "An error occurred while creating the menu type",
          error: err.message,
        });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Menu type created successfully" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred on the server",
      error: error.message,
    });
  }
};

const getAllMenuTypes = async (req, res) => {
  const { searchItem } = req.query;
console.log(searchItem );
  try {
      let getAllMenuTypesQuery;
      let queryParams;

      if (!searchItem) {
          // If no searchItem is provided, fetch all menu types
          getAllMenuTypesQuery = `
              SELECT * FROM tbl_menutype 
             
              
          `;
          queryParams = [];
      } else {
          // If searchItem is provided, search by menutype
          getAllMenuTypesQuery = `
              SELECT * FROM tbl_menutype 
              WHERE menutype LIKE ?
          `;
          // Add wildcard characters to the search term for partial matching
          const searchQuery = `%${searchItem}%`;
          queryParams = [searchQuery];
      }
      getAllMenuTypesQuery+=`  ORDER BY menutypeid DESC`

      // Execute the query
      db.pool.query(getAllMenuTypesQuery, queryParams, (err, results) => {
          if (err) {
              console.error("Database error:", err);
              res.status(500).json({
                  success: false,
                  message: "An error occurred while retrieving the menu types",
                  error: err.message,
              });
          } else {
              res.status(200).json({ success: true, data: results });
          }
      });
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
          success: false,
          message: "An error occurred on the server",
          error: error.message,
      });
  }
};

// PUT request to update a menu type by id
const updateMenuType = async (req, res) => {
  try {
    const { menutypeid } = req.params;
    const { menutype, status } = req.body;
    const menu_icon = req.file ? req.file.filename : null;

    const updateMenuTypeQuery = `
      UPDATE tbl_menutype
      SET menutype = ?, menu_icon = ?, status = ?
      WHERE menutypeid = ?
    `;
    const values = [menutype, menu_icon, status, menutypeid];

    db.pool.query(updateMenuTypeQuery, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).json({
          success: false,
          message: "An error occurred while updating the menu type",
          error: err.message,
        });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Menu type updated successfully" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred on the server",
      error: error.message,
    });
  }
};

// DELETE request to delete a menu type by id
const deleteMenuType = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteMenuTypeQuery = "DELETE FROM tbl_menutype WHERE menutypeid = ?";

    db.pool.query(deleteMenuTypeQuery, [id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).json({
          success: false,
          message: "An error occurred while deleting the menu type",
          error: err.message,
        });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Menu type deleted successfully" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred on the server",
      error: error.message,
    });
  }
};


const getTableBySale = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Base SQL query
    let sql = `
      SELECT 
        
        t.tableid, 
        t.tablename,
        co.order_id,
        co.order_date,
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
    sql += ` ORDER BY co.order_id DESC`;

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


const getMenuTypeById = async (req, res) => {
  const { id } = req.params; // Get the id from the request parameters

  try {
    const getMenuTypeByIdQuery = 'SELECT * FROM tbl_menutype WHERE menutypeid = ?'; // Using a placeholder for the id

    db.pool.query(getMenuTypeByIdQuery, [id], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: 'An error occurred while retrieving the menu type', error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ success: false, message: `Menu type with id ${id} not found` });
      } else {
        res.status(200).json({ success: true, data: results[0] }); // Return only the first result
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server', error: error.message });
  }
};
module.exports = {
  deleteMenuType,
  updateMenuType,
  getAllMenuTypes,
  createMenuType,
  getTableBySale,
  getMenuTypeById
};
