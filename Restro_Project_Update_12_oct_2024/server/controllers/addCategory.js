const db = require("../utils/db");
const fs = require("fs");
const path = require("path");

// Get all data of item_category

const getCategory = (req, res) => {
  const { searchName } = req.query;

  // SQL query with optional search filter
  const sql = `
    SELECT 
        i.CategoryID,
        i.Name,
        i.parentid,
        i.CategoryImage,
        i.CategoryIsActive,
        p.Name AS parent_name,
        p.CategoryID AS parent_id
    FROM 
        item_category i
    LEFT JOIN 
        item_category p ON i.parentid = p.CategoryID
    WHERE 
        ? IS NULL OR i.Name LIKE ?
        ORDER BY CategoryID DESC
       
  `;

  const params = [searchName, `%${searchName}%`]; 

  db.pool.query(sql, params, (err, data) => {
      if (err) {
          console.error("Database query error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      // Loop through the data to set parent_name to "No Parent" if parentid is 0
      const result = data.map((item) => ({
          ...item,
          parent_name: item.parentid === 0 ? "No Parent" : item.parent_name,
      }));

      return res.json(result);
  });
};





// Post data
const addCategory = (req, res) => {
  const { name, parentid, offerstartdate, offerendate, status, isoffer } = req.body;
  const UserIDInserted=req.id;
  
  // Extract filename from req.file if it exists, else set to null or default value
  const filename = req.file ? req.file.filename : null;

  try {
    const sql = `
      INSERT INTO item_category 
      (\`Name\`, \`parentid\`, \`offerstartdate\`, \`offerendate\`, \`CategoryIsActive\`, \`CategoryImage\`, \`isoffer\`,\`UserIDInserted\`) 
      VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    const values = [
      name,
      parentid,
      offerstartdate,
      offerendate,
      status,
      filename,  // Use the extracted filename or null
      isoffer,
      UserIDInserted,
    ];

    db.pool.query(sql, values, (err, data) => {
      if (err) {
        console.error("Database query error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.json({ message: "Data inserted successfully" });
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// delete


const deletCategory = (req, res) => {
  const id = req.params.id;

  const fetchImageSql = "SELECT CategoryImage FROM item_category WHERE CategoryID = ?";
  
  // Query to delete items related to the category in the item_foods table
  const deleteItemRelatedCategory = "DELETE FROM item_foods WHERE CategoryID = ?";
  
  // Query to delete variants related to the items in the variant table
  const deleteRelatedItemVariant = "DELETE FROM variant WHERE menuID IN (SELECT ProductsID FROM item_foods WHERE CategoryID = ?)";
  
  // Query to delete related add-ons in the menu_add_on table
  const deleteRelatedAddon = "DELETE FROM menu_add_on WHERE menu_id IN (SELECT ProductsID FROM item_foods WHERE CategoryID = ?)";

  // Query to delete the category itself
  const deleteCategorySql = "DELETE FROM item_category WHERE CategoryID = ?";
  
  db.pool.query(fetchImageSql, [id], (fetchErr, fetchData) => {
    if (fetchErr) {
      console.error("Database fetch error: ", fetchErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (fetchData.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const imageFilename = fetchData[0].CategoryImage;

    // Delete related add-ons
    db.pool.query(deleteRelatedAddon, [id], (addonDeleteErr, addonDeleteData) => {
      if (addonDeleteErr) {
        console.error("Error deleting related add-ons: ", addonDeleteErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Delete related variants
      db.pool.query(deleteRelatedItemVariant, [id], (variantDeleteErr, variantDeleteData) => {
        if (variantDeleteErr) {
          console.error("Error deleting related variants: ", variantDeleteErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Delete related items in the item_foods table
        db.pool.query(deleteItemRelatedCategory, [id], (itemDeleteErr, itemDeleteData) => {
          if (itemDeleteErr) {
            console.error("Error deleting related items: ", itemDeleteErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // Delete the category itself
          db.pool.query(deleteCategorySql, [id], (deleteErr, deleteData) => {
            if (deleteErr) {
              console.error("Error deleting category: ", deleteErr);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            if (imageFilename) {
              const filePath = path.join(__dirname, "../asset/category", imageFilename);
              if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error("Error deleting file: ", unlinkErr);
                    return res.status(500).json({ error: "File deletion error" });
                  }
                  return res.json({ message: "Category, related items, add-ons, and file deleted successfully" });
                });
              } else {
                return res.json({
                  message: "Category, related items, and add-ons deleted successfully, image file not found",
                });
              }
            } else {
              return res.json({
                message: "Category, related items, and add-ons deleted successfully, no associated image",
              });
            }
          });
        });
      });
    });
  });
};

const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, parentid, offerstartdate, offerendate, status, isoffer } =
    req.body;
  const filename = req.file ? req.file.filename : null; // Extract filename from req.file if provided
  const UserIDUpdated=req.id;
  // Fetch the current image filename if no new image is provided
  const fetchImageSql =
    "SELECT CategoryImage FROM item_category WHERE CategoryID = ?";

  db.pool.query(fetchImageSql, [id], (fetchErr, fetchData) => {
    if (fetchErr) {
      console.error("Database fetch error: ", fetchErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (fetchData.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const currentImageFilename = fetchData[0].CategoryImage;

    // Update the category
    const sql = `
      UPDATE item_category
      SET Name = ?, parentid = ?, offerstartdate = ?, offerendate = ?, CategoryIsActive = ?, CategoryImage = ?, isoffer = ?,UserIDUpdated=?
      WHERE CategoryID = ?`;

    const values = [
      name,
      parentid,
      offerstartdate,
      offerendate,
      status,
      filename || currentImageFilename, // Use new filename if provided, otherwise keep current
      isoffer,
      UserIDUpdated,
      id,
    ];

    db.pool.query(sql, values, (err, data) => {
      if (err) {
        console.error("Database query error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Delete the old image file if a new one was provided
      if (filename && currentImageFilename) {
        const oldFilePath = path.join(
          __dirname,
          "../asset/category",
          currentImageFilename
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old file: ", unlinkErr);
            }
          });
        }
      }

      return res.json({ message: "Data updated successfully" });
    });
  });
};

module.exports = { getCategory, addCategory, deletCategory, updateCategory };
