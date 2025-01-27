const db = require("../utils/db");

// GET request to fetch all add-ons
const getAddOns = async (req, res) => {
  try {
      const { searchItem } = req.query;
      console.log(searchItem)

      let getAddonQuery;
      let queryParams = [];

      if (!searchItem || searchItem.trim() === "") {
          // Fetch all add-ons if searchItem is not provided or is an empty string
          getAddonQuery = `
              SELECT * FROM add_ons
             
              
          `;
      } else {
          // Fetch add-ons based on search criteria
          getAddonQuery = `
              SELECT * FROM add_ons
              WHERE add_on_name LIKE ? OR price = ?
          `;
          const searchQuery = `%${searchItem}%`;
          queryParams = [searchQuery, searchItem];
      }

      getAddonQuery+=`  ORDER BY add_on_id DESC`
      // Execute the query
      db.pool.query(getAddonQuery, queryParams, (err, result) => {
          if (err) {
              console.log(err);
              return res.status(500).json({
                  success: false,
                  message: "An error occurred while fetching add-ons",
              });
          }

          res.status(200).json({
              success: true,
              data: result,
              message: "Add-ons fetched successfully",
          });
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// get active addons
const getActiveAddOns = async (req, res) => {
  try {
    const getaddon = `SELECT * FROM add_ons WHERE is_active = 1`;
    db.pool.query(getaddon, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json(data);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

// POST request to create a new add-on
const createAddOn = async (req, res) => {
  try {
    const { add_on_name, price, is_active } = req.body;

    // Check if any required fields are null or undefined
    // if (!add_on_name || !price || !is_active) {
    //   return res.status(400).json({ success: false, message: 'add_on_name, price, and is_active are required' });
    // }

    const createaddon = `INSERT INTO add_ons (add_on_name, price, is_active) VALUES ('${add_on_name}', '${price}', '${is_active}')`;

    db.pool.query(createaddon, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Add-on created successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const createAddOnWithAssign = async (req, res) => {
  try {
    const { addonName, price } = req.body;

    const createaddon = `INSERT INTO add_ons (add_on_name, price, is_active) VALUES ('${addonName}', '${price}', '1')`;

    db.pool.query(createaddon, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Add-on created successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

// PUT request to update an add-on by ID
const updateAddOn = async (req, res) => {
  try {
    console.log(req);
    const { add_on_Id } = req.params;

    const { add_on_name, price, is_active } = req.body;

    const updateaddon = `UPDATE add_ons SET add_on_name='${add_on_name}', price='${price}', is_active='${is_active}' WHERE add_on_id=${add_on_Id}`;

    db.pool.query(updateaddon, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ success: false, message: "An error occurredgfdggt" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Add-on updated successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getAddOnsById = async (req, res) => {
  const {id}=req.params;
  try {
    const getaddon = `SELECT * FROM add_ons WHERE add_on_id=?`;
    db.pool.query(getaddon,[id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred' });
      } else {
        res.status(200).json({ success: true, data: result, message: "Add-ons fetched successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};


// DELETE request to delete an add-on by ID
const deleteAddOn = async (req, res) => {
  //   try {
  const { id } = req.params;

  const deleteaddon = `DELETE FROM add_ons WHERE add_on_id=${id}`;

  db.pool.query(deleteaddon, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Add-on deleted successfully" });
    }
  });
  //   } catch (error) {
  //     res.status(500).json({ error: "An error occurred" });
  //   }
};

module.exports = {
  deleteAddOn,
  updateAddOn,
  getActiveAddOns,
  createAddOn,
  createAddOnWithAssign,
  getAddOns,
  getAddOnsById
};
