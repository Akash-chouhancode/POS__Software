const db = require("../utils/db");

const createUnitMeasurement = async (req, res) => {
  try {
    const { uom_name, uom_short_code, is_active } = req.body;

    const createUnit = `INSERT INTO unit_of_measurement (uom_name, uom_short_code, is_active) VALUES ('${uom_name}', '${uom_short_code}', '${is_active}')`;

    db.pool.query(createUnit, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          message: "Unit of measurement created successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getUnitMeasurements = async (req, res) => {
  const { searchItem } = req.query; // Corrected typo from seacrItem to searchItem
  try {
    let getUnitsQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
     
      getUnitsQuery = `
        SELECT *
        FROM unit_of_measurement ORDER BY id DESC
      `;
    } else {
    
      getUnitsQuery = `
        SELECT *
        FROM unit_of_measurement
        WHERE uom_name LIKE ? OR uom_short_code LIKE ?
        ORDER BY id DESC
      `;
      const searchQuery = `%${searchItem}%`; 
      queryParams = [searchQuery, searchQuery];
    }

    // Execute the query
    db.pool.query(getUnitsQuery, queryParams, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching units of measurement' });
      } else {
        res.status(200).json({ success: true, data: result, message: "Units of measurement fetched successfully" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


const deleteUnitMeasurement = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteUnit = "DELETE FROM unit_of_measurement WHERE id = ?";

    db.pool.query(deleteUnit, [id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ success: false, message: "An error occurred" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Unit of measurement not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Unit of measurement deleted successfully",
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

const updateUnitMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { uom_name, uom_short_code, is_active } = req.body;

    // Check if the unit of measurement exists
    const getUnitQuery = 'SELECT * FROM unit_of_measurement WHERE id = ?';
    db.pool.query(getUnitQuery, [id], (err, results) => {
      if (err) {
        console.error('Error retrieving unit of measurement:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while retrieving the unit of measurement' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Unit of measurement not found' });
      }

      // Get the current data
      const currentData = results[0];

      // Update only the provided fields, keeping the current values for unspecified fields
      const updatedData = {
        uom_name: uom_name !== undefined ? uom_name : currentData.uom_name,
        uom_short_code: uom_short_code !== undefined ? uom_short_code : currentData.uom_short_code,
        is_active: is_active !== undefined ? is_active : currentData.is_active,
      };

      // Update the unit of measurement
      const updateUnitQuery = `
        UPDATE unit_of_measurement 
        SET uom_name = ?, uom_short_code = ?, is_active = ?
        WHERE id = ?
      `;
      const values = [updatedData.uom_name, updatedData.uom_short_code, updatedData.is_active, id];

      db.pool.query(updateUnitQuery, values, (err, result) => {
        if (err) {
          console.error('Error updating unit of measurement:', err);
          return res.status(500).json({ success: false, message: 'An error occurred while updating the unit of measurement' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Unit of measurement not found' });
        }

        return res.status(200).json({ success: true, message: 'Unit of measurement updated successfully' });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};


const getUnitMeasurementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID parameter is required' });
    }

    const getUnitByIdQuery = `SELECT * FROM unit_of_measurement WHERE id = ?`;

    db.pool.query(getUnitByIdQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'An error occurred' });
      }

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Unit of measurement not found' });
      }

      res.status(200).json({
        success: true,
        data: result[0],
        message: 'Unit of measurement fetched successfully',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};





module.exports = {
  createUnitMeasurement,
  getUnitMeasurements,
  deleteUnitMeasurement,
  updateUnitMeasurement,
  getUnitMeasurementById
};
