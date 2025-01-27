const db = require("../utils/db");
// Add kitchen data
const addKitchen = (req, res) => {
  const { kitchenname, printername } = req.body;

  const sql = `INSERT INTO tbl_kitchen (kitchen_name, printer_id,status) VALUES (?, ?,1)`;
  const values = [kitchenname, printername];

  db.pool.query(sql, values, (err, data) => {
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      res.status(200).json({ message: "Kitchen added successfully", data });
    }
  });
};





// get Kitchen data
const getKitchen = async (req, res) => {
  const { searchItem } = req.query;
  console.log(searchItem);

  let getKitchenQuery;
  let queryParams = [];

  if (!searchItem || searchItem.trim() === "") {
    // Fetch all kitchens if searchItem is not provided or is an empty string
    getKitchenQuery = `
      SELECT 
        i.kitchenid,
        i.kitchen_name,
        i.printer_id,
        p.Name AS printer_name,
        p.id AS printer_id
      FROM 
        tbl_kitchen i
      LEFT JOIN 
        printers p ON i.printer_id = p.id
        ORDER BY kitchenid DESC
    `;
  } else {
    // Fetch kitchens based on search criteria
    getKitchenQuery = `
      SELECT 
        i.kitchenid,
        i.kitchen_name,
        i.printer_id,
        p.Name AS printer_name,
        p.id AS printer_id
      FROM 
        tbl_kitchen i
      LEFT JOIN 
        printers p ON i.printer_id = p.id
      WHERE 
        i.kitchen_name LIKE ? OR p.Name LIKE ?
        ORDER BY kitchenid DESC
    `;
    const searchQuery = `%${searchItem}%`;
    queryParams = [searchQuery, searchQuery];
  }

  // Execute the query
  db.pool.query(getKitchenQuery, queryParams, (err, data) => {
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      res.status(200).json(data);
    }
  });
};







// Delete Kitchen data
const deleteKitchenById = async (req, res) => {
  const { kitchenid } = req.params;
  const query = `DELETE FROM tbl_kitchen WHERE kitchenid = ?`;

  try {
    db.pool.query(query, [kitchenid], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the kitchen",
        });
      }

      if (result.affectedRows > 0) {
        return res
          .status(200)
          .json({ success: true, message: "Kitchen deleted successfully" });
      } else {
        return res.status(404).json({
          success: false,
          message: "No kitchen found with the provided kitchen ID",
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred" });
  }
};

// update Kitchen

const updateKitchenByKitchenId = async (req, res) => {
  try {
    const { kitchenId } = req.params;
    const { kitchen_name, printer_name } = req.body;

    // Query to get printerid from printers table
    const getPrinterIdQuery = "SELECT id FROM printers WHERE name = ?";

    // Execute the query to get printerid
    db.pool.query(getPrinterIdQuery, [printer_name], async (err, printerResult) => {
      if (err) {
        console.error("Error fetching printer id:", err);
        return res.status(500).send("Server error");
      }

      if (printerResult.length === 0) {
        return res.status(404).send("Printer not found");
      }

      const printerid = printerResult[0].id;

      // Update the kitchen record in the database
      const updateKitchenQuery = `UPDATE tbl_kitchen SET kitchen_name = ?, printer_id = ? WHERE kitchenid = ?`;

      db.pool.query(
        updateKitchenQuery,
        [kitchen_name, printerid, kitchenId],
        (err, result) => {
          if (err) {
            console.error("Error updating kitchen:", err);
            return res.status(500).send("Server error");
          }
          res.status(200).send("Kitchen updated successfully");
        }
      );
    });
  } catch (error) {
    console.error("Error in updateKitchenByKitchenId:", error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  addKitchen,
  getKitchen,
  deleteKitchenById,
  updateKitchenByKitchenId,
};
