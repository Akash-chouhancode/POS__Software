const db = require("../utils/db");


const createIngredient = async (req, res) => {
  try {
    const { ingredient_name, uom_short_code, min_stock, status } = req.body;

 
   

      // Query to create a new ingredient with is_active set to 1 by default
      const createIngredientQuery = `
          INSERT INTO ingredients (ingredient_name, uom_id, min_stock, status, is_active)
          VALUES (?, ?, ?, ?, 1)
        `;
      const values = [ingredient_name, uom_short_code, min_stock, status];

      db.pool.query(createIngredientQuery, values, (err, result) => {
        if (err) {
          console.error("Error while creating ingredient:", err);
          return res
            .status(500)
            .json({ success: false, message: "An error occurred" });
        }
        res
          .status(200)
          .json({ success: true, message: "Ingredient created successfully" });
      });
   
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred" });
  }
};


const getAllIngredients = async (req, res) => {
  const { searchItem } = req.query;
  
  try {
    let getAllIngredientsQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
      // Fetch all ingredients if searchItem is not provided or is an empty string
      getAllIngredientsQuery = `
        SELECT i.*, i.ingredient_name, uom.uom_short_code AS Unit_Name
        FROM ingredients AS i
        INNER JOIN unit_of_measurement AS uom ON i.uom_id = uom.id
        ORDER BY id DESC
      `;
    } else {
      // Fetch ingredients based on search criteria (ingredient_name or uom_short_code)
      getAllIngredientsQuery = `
        SELECT i.*, i.ingredient_name, uom.uom_short_code AS Unit_Name
        FROM ingredients AS i
        INNER JOIN unit_of_measurement AS uom ON i.uom_id = uom.id
        WHERE i.ingredient_name LIKE ? OR uom.uom_short_code LIKE ?
        ORDER BY id DESC
      `;
      const searchQuery = `%${searchItem}%`; // Adding wildcards for partial matching
      queryParams = [searchQuery, searchQuery];
    }

    // Execute the query
    db.pool.query(getAllIngredientsQuery, queryParams, (err, results) => {
      if (err) {
        console.error('Error while retrieving ingredients:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while retrieving ingredients' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'No ingredients found' });
      }

      res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};



const getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID parameter is required' });
    }

    // Query to get ingredient by ID with uom_short_code
    const getIngredientByIdQuery = `
      SELECT i.*, i.ingredient_name, uom.uom_short_code AS Unit_Name
      FROM ingredients AS i
      INNER JOIN unit_of_measurement AS uom ON i.uom_id = uom.id
      WHERE i.id = ?
    `;

    db.pool.query(getIngredientByIdQuery, [id], (err, result) => {
      if (err) {
        console.error('Error while retrieving the ingredient:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while retrieving the ingredient' });
      }

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }

      res.status(200).json({ success: true, data: result[0] });
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};


const updateIngredient = async (req, res) => {
  const { id } = req.params;
  console.log(id)
;
  const { ingredient_name, uom_id, min_stock, is_active} = req.body;
 
  // Query to get the current ingredient details
  const query = 'SELECT * FROM ingredients WHERE id = ?';
  db.pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error while retrieving ingredient:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while retrieving the ingredient record' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    const currentData = results[0];

   

      // Prepare updated data by checking for undefined values
      const updateData = {
        ingredient_name: ingredient_name !== undefined ? ingredient_name : currentData.ingredient_name,
        uom_id: uom_id !== undefined ? uom_id : currentData.uom_id,
        min_stock: min_stock !== undefined ? min_stock : currentData.min_stock,
     
        is_active: is_active!==undefined?is_active:currentData.is_active 
      };

      // Query to update the ingredient
      const updateIngredientQuery = `
        UPDATE ingredients 
        SET ingredient_name = ?, uom_id = ?, min_stock = ?, is_active = ? 
        WHERE id = ?
      `;
      const values = [
        updateData.ingredient_name,
        updateData.uom_id,
        updateData.min_stock,
      
        updateData.is_active,
        id
      ];

      db.pool.query(updateIngredientQuery, values, (err, result) => {
        if (err) {
          console.error('Error while updating ingredient:', err);
          return res.status(500).json({ success: false, message: 'An error occurred while updating the ingredient' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        return res.status(200).json({ success: true, message: 'Ingredient updated successfully' });
      });
    });
  }



const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    // Query to delete the ingredient
    const deleteIngredientQuery = `
      DELETE FROM ingredients
      WHERE id = ?
    `;

    db.pool.query(deleteIngredientQuery, [id], (err, result) => {
      if (err) {
        console.error('Error while deleting ingredient:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while deleting ingredient' });
      }

      // Check if any rows were affected; if none, return 404
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Ingredient not found or no changes applied' });
      }

      res.status(200).json({ success: true, message: 'Ingredient deleted successfully' });
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

module.exports = { createIngredient, getAllIngredients, deleteIngredient,getIngredientById,updateIngredient };
