const db = require("../utils/db");

const createTable = async (req, res) => {
  try {
    const { tablename, person_capicity, floorName } = req.body;

    

    // Insert the new table with the provided details
    const createTableQuery = `
      INSERT INTO rest_table (tablename, person_capicity, floor, status)
      VALUES (?, ?, ?, ?)
    `;
    const values = [tablename, person_capicity, floorName, 1]; // Default status to 1 (active or free)

    // Execute the query
    db.pool.query(createTableQuery, values, (err, result) => {
      if (err) {
        console.error("Error creating table:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while creating the table",
        });
      }

      // Respond with success message
      res.status(200).json({
        success: true,
        message: "Table created successfully",
       
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};

const getTables = async (req, res) => {
  try {
    const { searchItem } = req.query;
    console.log(searchItem);

    let getTablesQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
      // Fetch all tables if searchItem is not provided or is an empty string
      getTablesQuery = `
        SELECT tableid, tablename, person_capicity,  status,floor
        FROM rest_table ORDER BY tableid DESC
      `;
    } else {
      // Fetch tables based on search criteria
      getTablesQuery = `
        SELECT tableid, tablename, person_capicity,  status,floor
        FROM rest_table
        WHERE tablename LIKE ? OR person_capicity LIKE ?
        ORDER BY tableid DESC
      `;
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery, searchQuery];
    }

    // Execute the query
    db.pool.query(getTablesQuery, queryParams, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while retrieving tables",
        });
      } else {
        // Map the status field to 'booked' or 'free'
        const tables = results.map((table) => ({
          ...table,
          status: table.status === 1 ? "booked" : "free",
        }));

        res.status(200).json({ success: true, data: tables });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

const getBookedTable = async (req, res) => {
  try {
    const getBookedTableQuery = `
      SELECT *
      FROM rest_table
      WHERE rest_table.status = 1
    `;

    db.pool.query(getBookedTableQuery, (err, results) => {
      if (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: 'An error occurred while retrieving tables' });
      } else {
        res.status(200).json({ success: true, data: results });
      }
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};


const getunBookedTable = async (req, res) => {
  try {
    const getUnBookedTableQuery = `
      SELECT *
      FROM rest_table
      WHERE rest_table.status = 0
    `;

    db.pool.query(getUnBookedTableQuery, (err, results) => {
      if (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: 'An error occurred while retrieving tables' });
      } else {
        res.status(200).json({ success: true, data: results });
      }
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};



const cleartable = async (req, res) => {
  const tableId = req.params.tableId;
  const clearTableQuery = `UPDATE rest_table SET status = 0 WHERE tableid = ?`;

  db.pool.query(clearTableQuery, tableId, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "An error occurred while clearing the table",
      });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Table cleared successfully" });
    }
  });
};


const deleteTable = async (req, res) => {
  try {
    const tableId = req.params.id; // Assuming the table ID is passed as a URL parameter

    const deleteTableQuery = `
      DELETE FROM rest_table WHERE tableid = ?
    `;

    db.pool.query(deleteTableQuery, [tableId], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred' });
      } else {
        res.status(200).json({ success: true, message: 'Table deleted successfully' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};




const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Table ID is required" });
    }

    const getTableByIdQuery = `
      SELECT tableid, tablename, person_capicity, status,floor
      FROM rest_table
      WHERE tableid = ?
    `;

    db.pool.query(getTableByIdQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while retrieving the table",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "Table not found" });
      }

      const table = {
        ...result[0],
        status: result[0].status === 1 ? "booked" : "free",
      };

      res.status(200).json({
        success: true,
        data: table,
        message: "Table fetched successfully",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

//update table
const updateTable = async (req, res) => {
  try {
    const { tableid } = req.params;
    const { tablename, person_capicity, floorName } = req.body;

    console.log("sdsah",tableid)
    // Fetch the current data of the table
    const fetchCurrentDataSql = "SELECT * FROM rest_table WHERE tableid = ?";
    db.pool.query(fetchCurrentDataSql, [tableid], async (fetchErr, fetchData) => {
      if (fetchErr) {
        console.error("Database fetch error: ", fetchErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (fetchData.length === 0) {
        return res.status(404).json({ success: false, message: 'Table not found' });
      }

      const currentData = fetchData[0];

      // Merge current and new data
      const updatedData = {
        tablename: tablename !== undefined ? tablename : currentData.tablename,
        person_capicity: person_capicity !== undefined ? person_capicity : currentData.person_capicity,
        floor: floorName !== undefined ? floorName : currentData.floor,
        status: currentData.status || 1,  // Assuming status is set to 1 by default
      };

      // Update the table with the merged data
      const updateTableQuery = `
        UPDATE rest_table 
        SET tablename = ?, person_capicity = ?, floor = ?, status = ? 
        WHERE tableid = ?
      `;
      db.pool.query(updateTableQuery, [
        updatedData.tablename,
        updatedData.person_capicity,
        updatedData.floor,
        updatedData.status,
        tableid
      ], (updateErr, result) => {
        if (updateErr) {
          console.error("Database query error: ", updateErr);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        } else if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Table not found' });
        } else {
          return res.status(200).json({ success: true, message: "Table updated successfully" });
        }
      });
    });

  } catch (error) {
    console.error("Update table error: ", error);
    return res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

module.exports = { createTable, getTables, cleartable,getBookedTable,getunBookedTable,deleteTable,getTableById ,updateTable};
