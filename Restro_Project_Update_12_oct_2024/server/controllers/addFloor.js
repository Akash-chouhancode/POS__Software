const db = require("../utils/db");

const createFloor = async (req, res) => {
  try {
    const { floorName } = req.body;

    const createFloorQuery = `INSERT INTO tbl_tablefloor (floorName) VALUES (?)`;
    db.pool.query(createFloorQuery, [floorName], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Floor created successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};
const getFloors = async (req, res) => {
  try {
    const { searchItem } = req.query;
    console.log(searchItem);

    let getFloorsQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
      // Fetch all floors if searchItem is not provided or is an empty string
     getFloorsQuery = `SELECT * FROM tbl_tablefloor ORDER BY tbfloorid DESC`;

    } else {
      // Fetch floors based on search criteria
      getFloorsQuery = `SELECT * FROM tbl_tablefloor WHERE floorName LIKE ? ORDER BY tbfloorid DESC;
`;
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery];
    }

    // Execute the query
    db.pool.query(getFloorsQuery, queryParams, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: 'An error occurred while fetching floors',
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Floors fetched successfully',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};
//update 

const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { floorName } = req.body;

    // Step 1: Fetch the current floor data
    const fetchCurrentDataSql = 'SELECT * FROM tbl_tablefloor WHERE tbfloorid = ?';
    db.pool.query(fetchCurrentDataSql, [id], (fetchErr, fetchData) => {
      if (fetchErr) {
        console.error('Database fetch error:', fetchErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (fetchData.length === 0) {
        return res.status(404).json({ success: false, message: 'Floor record not found' });
      }

      const currentData = fetchData[0];

      // Step 2: Prepare the updated data
      const updatedData = {
        floorName: floorName !== undefined ? floorName : currentData.floorName
      };

      // Step 3: Update the floor record
      const updateFloorQuery = `
        UPDATE tbl_tablefloor 
        SET floorName = ? 
        WHERE tbfloorid = ?
      `;
      db.pool.query(updateFloorQuery, [
        updatedData.floorName,
        id
      ], (updateErr, result) => {
        if (updateErr) {
          console.error('Database update error:', updateErr);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        } else if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Floor record not found' });
        } else {
          return res.status(200).json({ success: true, message: 'Floor updated successfully' });
        }
      });
    });

  } catch (error) {
    console.error('Update floor error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

// get by id
const getFloorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Floor ID is required' });
    }

    const getFloorByIdQuery = `SELECT * FROM tbl_tablefloor WHERE 	tbfloorid  = ?`;

    db.pool.query(getFloorByIdQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'An error occurred' });
      }

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Floor not found' });
      }

      res.status(200).json({
        success: true,
        data: result[0],
        message: 'Floor fetched successfully',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

const deleteFloor = async (req, res) => {
  try {
    const { floorID } = req.params;

    const deleteFloorQuery = `DELETE FROM tbl_tablefloor WHERE tbfloorid  = ?`;
    db.pool.query(deleteFloorQuery, [floorID], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the floor' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ success: false, message: "Floor not found" });
      } else {
        res.status(200).json({ success: true, message: "Floor deleted successfully" });
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};
module.exports = { createFloor, getFloors,deleteFloor,updateFloor ,getFloorById};
