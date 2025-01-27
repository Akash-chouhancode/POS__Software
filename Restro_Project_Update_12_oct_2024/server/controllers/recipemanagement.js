const db = require("../utils/db");

// Helper function to execute queries with a promise
function queryDb(query, params) {
  return new Promise((resolve, reject) => {
    db.pool.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

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

const getalldetailsProductiondetails = async (req, res) => {
  try {
    const { searchItem } = req.query; // Get searchItem from query parameters
    console.log(searchItem);

    // Step 1: Fetch foodid and pvarientid from production_details
    let foodVariantQuery = `
      SELECT foodid, pvarientid, ingredientid, qty AS productionqty,pro_detailsid 
      FROM production_details 
    `;

    let queryParams = []; // Array to hold query parameters for the SQL query

    // Adding search condition if searchItem is provided
    if (searchItem) {
      const searchValue = `%${searchItem}%`; // Wildcard for partial match
      foodVariantQuery += `
        WHERE foodid IN (
          SELECT ProductsID FROM item_foods WHERE ProductName LIKE ?
        ) 
        OR pvarientid IN (
          SELECT variantid FROM variant WHERE variantName LIKE ?
        )
      `;
      // Push the search values to the queryParams array
      queryParams.push(searchValue, searchValue);
    }
    foodVariantQuery += " ORDER BY pro_detailsid DESC";
    const productionDetails = await queryDb(foodVariantQuery, queryParams);

    if (!productionDetails || productionDetails.length === 0) {
      return res.status(404).send({ message: 'No production details found' });
    }

    // Step 2: Extract ingredient IDs and fetch purchase details for each ingredient
    const ingredientIds = productionDetails.map(item => item.ingredientid);

    const purchaseQuery = `
      SELECT pd.indredientid, SUM(pd.quantity) AS total_quantity, SUM(pd.totalprice) AS total_price
      FROM purchase_details pd
      WHERE pd.indredientid IN (?)
      GROUP BY pd.indredientid
    `;
    const purchaseDetails = await queryDb(purchaseQuery, [ingredientIds]);

    if (!purchaseDetails || purchaseDetails.length === 0) {
      return res.status(404).send({ message: 'No purchase details found for the ingredient(s)' });
    }

    // Step 3: Fetch food names, variant names, and ingredient names
    const foodIds = [...new Set(productionDetails.map(item => item.foodid))];
    const variantIds = [...new Set(productionDetails.map(item => item.pvarientid))];

    const foodNameQuery = `
      SELECT items.ProductName AS foodName, items.ProductsID 
      FROM item_foods items 
      WHERE items.ProductsID IN (?)
    `;
    const foodNameResults = await queryDb(foodNameQuery, [foodIds]);

    const variantNameQuery = `
      SELECT v.variantName, v.variantid 
      FROM variant v 
      WHERE v.variantid IN (?)
    `;
    const variantNameResults = await queryDb(variantNameQuery, [variantIds]);

    const ingredientNameQuery = `
      SELECT id, ingredient_name 
      FROM ingredients 
      WHERE id IN (?)
    `;
    const ingredientNames = await queryDb(ingredientNameQuery, [ingredientIds]);

    // Step 4: Create lookups for food, variant, and ingredient names
    const foodNameLookup = {};
    foodNameResults.forEach(item => {
      foodNameLookup[item.ProductsID] = item.foodName;
    });

    const variantNameLookup = {};
    variantNameResults.forEach(item => {
      variantNameLookup[item.variantid] = item.variantName;
    });

    const ingredientNameLookup = {};
    ingredientNames.forEach(item => {
      ingredientNameLookup[item.id] = item.ingredient_name;
    });

    // Step 5: Merge production details with purchase details and group by foodid and pvarientid
    const result = {};

    productionDetails.forEach(detail => {
      const ingredientPurchaseDetail = purchaseDetails.find(purchase => purchase.indredientid === detail.ingredientid);
      const pricePerUnit = ingredientPurchaseDetail ? (ingredientPurchaseDetail.total_price / ingredientPurchaseDetail.total_quantity) : 0;
      const productionPrice = pricePerUnit * detail.productionqty;

      const key = `${detail.foodid}-${detail.pvarientid}`;
      if (!result[key]) {
        result[key] = {
          foodid: detail.foodid,
          pvarientid: detail.pvarientid,
          totalAmount: 0,
          foodName: foodNameLookup[detail.foodid] || 'Unknown',
          variantName: variantNameLookup[detail.pvarientid] || 'Unknown'
        };
      }

      result[key].totalAmount += productionPrice;
    });

    // Step 6: Filter results based on searchItem for totalAmount
    let filteredResults = Object.values(result);
    if (searchItem) {
      filteredResults = filteredResults.filter(item => 
        item.foodName.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.variantName.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.totalAmount.toString().includes(searchItem)
      );
    }

    res.status(200).send({ data: filteredResults });
  } catch (error) {
    console.error("Error fetching production details:", error);
    res.status(500).send({ message: 'Server Error', error });
  }
};
// food name
const foodNameFetchApi = async (req, res) => {
  
  
  // Corrected SQL query
  const sql = `
    SELECT ProductName,ProductsID
    FROM item_foods WHERE item_foods.ProductsIsActive=1;
   
  `;

  try {
    // Await the dbQuery function result
    const result = await dbQuery(sql);

    // Return the result as JSON response
    return res.status(200).json({ success: true, data: result });
    
  } catch (err) {
    console.error('Error in foodNAME:', err);
    return res.status(500).json({ success: false, message: 'An internal error occurred' });
  }
};
// variant name accourding to food
const foodWithVariant = async (req, res) => {
  const { foodid } = req.query;
  console.log(foodid);
  
  // Corrected SQL query
  const sql = `
    SELECT v.variantname, i.ProductName,variantid
    FROM variant v 
    LEFT JOIN item_foods i ON i.ProductsID = v.menuid 
    WHERE  i.ProductsID = ?
  `;

  try {
    // Await the dbQuery function result
    const result = await dbQuery(sql, [foodid]);

    // Return the result as JSON response
    return res.status(200).json({ success: true, data: result });
    
  } catch (err) {
    console.error('Error in foodWithVariant:', err);
    return res.status(500).json({ success: false, message: 'An internal error occurred' });
  }
};


const createProduction = async (req, res) => {
  const { itemid, itemvid, itemquantity, saveddate, productionexpiredate } = req.body;
 const savedby=req.id;
  try {
    // Step 1: Get ingredient quantities per unit for the item and variant
    const ingredientQuery = `
      SELECT ingredientid, qty AS ingredient_quantity_per_unit
      FROM production_details
      WHERE foodid = ? AND pvarientid = ?`;
    const ingredientResults = await dbQuery(ingredientQuery, [itemid, itemvid]);

    if (!ingredientResults || ingredientResults.length === 0) {
      return res.status(404).json({ message: 'Please set Ingredients first!' });
    }

    // Step 2: Iterate over ingredients and calculate the new stock based on units served
    for (const ingredient of ingredientResults) {
      const ingredientId = ingredient.ingredientid;
      const qtyPerUnit = ingredient.ingredient_quantity_per_unit; // qty required per unit for this ingredient

      // Get the current stock of the ingredient
      const stockQuery = 'SELECT stock_qty FROM ingredients WHERE id = ?';
      const [stockResult] = await dbQuery(stockQuery, [ingredientId]);

      if (!stockResult) {
        return res.status(404).json({ message: `Ingredient with ID ${ingredientId} not found!` });
      }

      const stockQty = stockResult.stock_qty;

      // Calculate the total quantity to deduct based on the units served
      const totalQtyToDeduct = itemquantity * qtyPerUnit;

      // Check if stock is sufficient for this ingredient
      if (totalQtyToDeduct > stockQty) {
        return res.status(400).json({ message: `Insufficient stock for ingredient ID ${ingredientId}. Stock available: ${stockQty}kg, required: ${totalQtyToDeduct}kg` });
      }

      // Deduct the quantity from the stock
      const newStockQty = stockQty - totalQtyToDeduct;
      const updateStockQuery = 'UPDATE ingredients SET stock_qty = ? WHERE id = ?';
      await dbQuery(updateStockQuery, [newStockQty, ingredientId]);
    }

    // Step 3: Update or insert the production record
    const checkProductionQuery = 'SELECT itemquantity FROM production WHERE itemid = ? AND itemvid = ?';
    const [productionResult] = await dbQuery(checkProductionQuery, [itemid, itemvid]);

    if (productionResult) {
      // Update existing production record
      const existingQuantity = productionResult.itemquantity;
      const newQuantity = existingQuantity + itemquantity;

      const updateProductionQuery = `
        UPDATE production
        SET itemquantity = ?, savedby = ?, saveddate = ?, productionexpiredate = ?
        WHERE itemid = ? AND itemvid = ?`;
      await dbQuery(updateProductionQuery, [newQuantity, savedby, saveddate, productionexpiredate, itemid, itemvid]);

      return res.status(200).json({ success: true, message: 'Production entry updated successfully' });
    } else {
      // Insert new production record
      const insertProductionQuery = `
        INSERT INTO production (itemid, itemvid, itemquantity, savedby, saveddate, productionexpiredate)
        VALUES (?, ?, ?, ?, ?, ?)`;
      const result = await dbQuery(insertProductionQuery, [itemid, itemvid, itemquantity, savedby, saveddate, productionexpiredate]);

      return res.status(201).json({ success: true, message: 'Production entry created successfully', productionid: result.insertId });
    }
  } catch (err) {
    console.error('Error in createProduction:', err);
    return res.status(500).json({ success: false, message: 'An error occurred during production creation' });
  }
};
// get supplier leddger
const getPurchaseTransactions = (req, res) => {
  const { startDate, endDate, supplier_id } = req.query;

  // Base query
  let query = `
    SELECT 
      p.suplierID, 
      p.total_price AS credit, 
      p.paid_amount AS debit, 
      p.purchasedate AS purchase_date, 
      p.details AS description,
      s.amount AS ledger_amount,
      s.d_c,
      p.invoiceid
    
    FROM purchaseitem p
    LEFT JOIN supplier_ledger s 
      ON p.suplierID = s.supplier_id
    WHERE 1 = 1
  `;

  // Array to hold the query parameters
  const queryParams = [];

  // Conditionally add supplier_id filter if provided
  if (supplier_id) {
    query += " AND p.suplierID = ?";
    queryParams.push(supplier_id);
  }

  // Conditionally add date range filter if startDate and endDate are provided
  if (startDate && endDate) {
    query += " AND p.purchasedate BETWEEN ? AND ?";
    queryParams.push(startDate, endDate);
  }

  // Execute the query with the parameters
  db.pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching purchase transactions:', err);
      res.status(500).json({ success: false, message: 'An error occurred while fetching purchase transactions' });
    } else {
      res.status(200).json({ success: true, data: results, message: 'Purchase transactions fetched successfully' });
    }
  });
};

// set production unit //

const getAllStockIngredients = async (req, res) => {
  const query = 'SELECT ingredient_name,id FROM ingredients WHERE is_active=1';
  
  db.pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data from ingredients table: ', err);
          return res.status(500).json({ message: 'Database error' });
      }
      res.json({data:results});
  });
};


const getAllStockIngredientswithone = async (req, res) => {
  const query = 'SELECT ingredient_name, id FROM ingredients WHERE is_active = 1 AND stock_qty > 0';

  db.pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from ingredients table:', err);
      return res.status(500).json({ error: 'Failed to retrieve ingredients due to a database error' });
    }
    res.status(200).json({ data: results });
  });
};

 



const getPerItemPrice = async (req, res) => {
  const { id } = req.params;

  // SQL query to get the total quantity and total price for a specific ingredient
  const query = `
    SELECT SUM(quantity) AS totalquantity, 
           SUM(totalprice) AS totalprice 
    FROM purchase_details 
    WHERE indredientid = ? 
    GROUP BY indredientid
  `;

  try {
    // Use the dbQuery helper function to execute the query
    const result = await dbQuery(query, [id]);

    // Check if the ingredient exists
    if (result.length === 0) {
      return res.status(404).send('Ingredient not found');
    }

    // Extract total quantity and price from the result
    const { totalquantity, totalprice } = result[0];
    const pricePerIngredient = totalprice / totalquantity; // Calculate price per ingredient

    // Return the result in a response
    return res.status(200).json({
      data: [{ Price: pricePerIngredient }]
    });

  } catch (err) {
    // Handle errors in the database query
    console.error('Error fetching total quantity and price:', err);
    return res.status(500).send('Server error');
  }
};

const createproduction = async (req, res) => {
  try {
    const fooddetails = req.body.fooddetails; // Array of food details
    const itemdetails = req.body.itemdetails; // Array of item details
    const newDate = new Date();
    const createdby=req.id;
//  console.log(fooddetails,itemdetails)
    // Validate if fooddetails and itemdetails are present
    if (!fooddetails || fooddetails.length === 0 || !itemdetails || itemdetails.length === 0) {
      return res.status(400).json({ message: 'No food details or item details provided' });
    }

    // Loop through food details array (in case there are multiple food entries)
    for (let food of fooddetails) {
      const { foodid, pvarientid } = food;

      // Check if production details already exist for each food entry
      const checkQuery = `
        SELECT * FROM production_details 
        WHERE foodid = ? AND pvarientid = ?
      `;
      const existingRecords = await queryDb(checkQuery, [foodid, pvarientid]);

      if (existingRecords.length > 0) {
        return res.status(400).json({ message: `Production details already exist for foodid ${foodid} and pvarientid ${pvarientid}` });
      }

      // Insert item details related to this food entry
      for (let item of itemdetails) {
        const { p_id, quantity } = item;

        if (!quantity || !p_id) {
          return res.status(400).json({ message: 'Invalid item details provided' });
        }

        const data = {
          foodid: foodid,
          pvarientid: pvarientid,
          ingredientid: p_id,
          qty: quantity,
          created_date: newDate,
          createdby:createdby,
        };

        // Insert data into production_details table
        await queryDb('INSERT INTO production_details SET ?', data);
      }
    }

    // Return success message after all inserts are done
    return res.status(200).json({ message: 'Successfully added production details' });
  } catch (err) {
    console.error('Error in createproduction:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


const findbyIdProductiondetails = async (req, res) => {
  const { foodid, pvarientid } = req.params;

  try {
      // Query to fetch production details
      const sql = `
        SELECT p.foodid, p.pvarientid, p.ingredientid, p.qty AS productionqty
        FROM production_details p
        WHERE p.foodid = ? AND p.pvarientid = ?
      `;

      // Execute the query to get production details
      const productionDetails = await queryDb(sql, [foodid, pvarientid]);

      // Check if any production details are found
      if (!productionDetails || productionDetails.length === 0) {
          return res.status(404).send({ message: 'No production details found' });
      }

      // Extract the ingredient IDs
      const ingredientIds = productionDetails.map(item => item.ingredientid);

      // Prepare query to fetch total quantity and total price for each ingredient
      const sql2 = `
        SELECT pd.indredientid, SUM(pd.quantity) AS total_quantity, SUM(pd.totalprice) AS total_price
        FROM purchase_details pd
        WHERE pd.indredientid IN (?)
        GROUP BY pd.indredientid
      `;

      // Execute the second query for purchase details
      const purchaseDetails = await queryDb(sql2, [ingredientIds]);

      // Fetch the food name
      const foodNameQuery = await queryDb('SELECT items.ProductName AS foodName FROM item_foods items WHERE items.ProductsID = ?', [foodid]);

      // Fetch the variant name
      const variantNameQuery = await queryDb('SELECT v.variantName FROM variant v WHERE v.variantid = ?', [pvarientid]);

      // Fetch the ingredient names
      const ingredientNameFetchQuery = await queryDb('SELECT id, ingredient_name FROM ingredients WHERE id IN (?)', [ingredientIds]);

      // Check if purchase details are found
      if (!purchaseDetails || purchaseDetails.length === 0) {
          return res.status(404).send({ message: 'No purchase details found for the ingredient(s)' });
      }

      // Extract the first `foodName` and `variantName` because they are the same for all ingredients
      const foodDetails = {
          foodName: foodNameQuery[0].foodName || "not found",
          variantName: variantNameQuery[0].variantName || "not found",
          foodid: foodid,
          pvarientid: pvarientid
      };

      // Calculate the price for each ingredient and create the `itemdetails` array
      const itemDetails = purchaseDetails.map(detail => {
          // Find the matching production quantity for this ingredient
          const productionDetail = productionDetails.find(item => item.ingredientid === detail.indredientid);
          
          // Find the matching ingredient name
          const ingredientName = ingredientNameFetchQuery.find(item => item.id === detail.indredientid);
          const ingredientNameValue = ingredientName ? ingredientName.ingredient_name : 'Unknown Ingredient';

          // Calculate the price per unit for the ingredient
          const productionQty = productionDetail ? productionDetail.productionqty : 0;
          const pricePerUnit = detail.total_price / detail.total_quantity;
          const totalPriceForProduction = pricePerUnit * productionQty;

          return {
              ingredientid: detail.indredientid,
              productionDetailqty: productionQty,
              total_quantity: detail.total_quantity,
              total_price: detail.total_price,
              price: pricePerUnit,
              totalPriceofproductioningredient: totalPriceForProduction.toFixed(2),
              ingredient_name: ingredientNameValue
          };
      });

      // Structure the final response
      const response = {
          data: {
              fooddetails: [foodDetails],
              itemdetails: itemDetails
          }
      };

      // Send the response with the structured data
      res.status(200).send(response);

  } catch (error) {
      // Catch and log any errors, then send a server error response
      console.error(error);
      res.status(500).send({ message: 'Server error', error });
  }
};


const viewProductiondetails = async (req, res) => {
  const { foodid, pvarientid } = req.params;

  try {
      // Query to fetch production details
      const sql = `
        SELECT p.foodid, p.pvarientid, p.ingredientid, p.qty AS productionqty
        FROM production_details p
        WHERE p.foodid = ? AND p.pvarientid = ?
      `;

      // Execute the query to get production details
      const productionDetails = await queryDb(sql, [foodid, pvarientid]);

      // Check if any production details are found
      if (!productionDetails || productionDetails.length === 0) {
          return res.status(404).send({ message: 'No production details found' });
      }

      // Extract the ingredient IDs
      const ingredientIds = productionDetails.map(item => item.ingredientid);

      // Prepare query to fetch total quantity and total price for each ingredient
      const sql2 = `
        SELECT pd.indredientid, SUM(pd.quantity) AS total_quantity, SUM(pd.totalprice) AS total_price
        FROM purchase_details pd
        WHERE pd.indredientid IN (?)
        GROUP BY pd.indredientid
      `;

      // Execute the second query for purchase details
      const purchaseDetails = await queryDb(sql2, [ingredientIds]);

      // Fetch the food name
      const foodNameQuery = await queryDb('SELECT items.ProductName AS foodName FROM item_foods items WHERE items.ProductsID = ?', [foodid]);

      // Fetch the variant name
      const variantNameQuery = await queryDb('SELECT v.variantName FROM variant v WHERE v.variantid = ?', [pvarientid]);

      // Fetch the ingredient names
      const ingredientNameFetchQuery = await queryDb('SELECT id, ingredient_name FROM ingredients WHERE id IN (?)', [ingredientIds]);

      // Check if purchase details are found
      if (!purchaseDetails || purchaseDetails.length === 0) {
          return res.status(404).send({ message: 'No purchase details found for the ingredient(s)' });
      }

      // Extract the first `foodName` and `variantName` because they are the same for all ingredients
      const foodDetails = {
          foodName: foodNameQuery[0].foodName || "not found",
          variantName: variantNameQuery[0].variantName || "not found",
          foodid: foodid,
          pvarientid: pvarientid
      };

      // Calculate the price for each ingredient and create the `itemdetails` array
      const itemDetails = purchaseDetails.map(detail => {
          // Find the matching production quantity for this ingredient
          const productionDetail = productionDetails.find(item => item.ingredientid === detail.indredientid);
          
          // Find the matching ingredient name
          const ingredientName = ingredientNameFetchQuery.find(item => item.id === detail.indredientid);
          const ingredientNameValue = ingredientName ? ingredientName.ingredient_name : 'Unknown Ingredient';

          // Calculate the price per unit for the ingredient
          const productionQty = productionDetail ? productionDetail.productionqty : 0;
          const pricePerUnit = detail.total_price / detail.total_quantity;
          const totalPriceForProduction = pricePerUnit * productionQty;

          return {
              ingredientid: detail.indredientid,
              productionDetailqty: productionQty,
              total_quantity: detail.total_quantity,
              total_price: detail.total_price,
              price: pricePerUnit,
              totalPriceofproductioningredient: totalPriceForProduction.toFixed(2),
              ingredient_name: ingredientNameValue
          };
      });
      const totalPriceSum = itemDetails.reduce((sum, item) => {
        return sum + parseFloat(item.totalPriceofproductioningredient);
    }, 0);


      // Structure the final response
      const response = {
          data: {
              fooddetails: [foodDetails],
              itemdetails: itemDetails,
              totalPriceSum
          }
      };

      // Send the response with the structured data
      res.status(200).send({data:response});

  } catch (error) {
      // Catch and log any errors, then send a server error response
      console.error(error);
      res.status(500).send({ message: 'Server error', error });
  }
};




const updateProductionDetail = async (req, res) => {
  try {
    const { foodnameid, pvarientnameid } = req.params; // Get foodid and pvarientid from request parameters
    console.log("Received foodid:", foodnameid, "pvarientid:",pvarientnameid); // Debug log

    const fooddetails = req.body.fooddetails;
    const itemdetails = req.body.itemdetails;
    const createdby = 178;  // Assuming createdby is a static value
    const created_date = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Format date to 'YYYY-MM-DD HH:mm:ss'

    // Check if fooddetails and itemdetails are provided
    if (!fooddetails || fooddetails.length === 0 || !itemdetails || itemdetails.length === 0) {
      return res.status(400).json({ message: 'No food details or item details provided' });
    }

    // Start a transaction
    await queryDb('START TRANSACTION');

    // Loop through food details
    for (let food of fooddetails) {
      const { foodid, pvarientid } = food;

      // Fetch existing records to check if they exist
      const fetchCurrentDataSql = 'SELECT * FROM production_details WHERE foodid = ? AND pvarientid = ?';
      const fetchData = await queryDb(fetchCurrentDataSql, [foodnameid, pvarientnameid]);

      console.log("Fetched data for foodid:", foodnameid, "pvarientid:", pvarientnameid, fetchData); // Debug log

      if (fetchData.length === 0) {
        return res.status(404).json({ success: false, message: 'Production detail record not found' });
      }

      // Delete existing records with matching `foodid` and `pvarientid`
      const deleteQuery = 'DELETE FROM production_details WHERE foodid = ? AND pvarientid = ?';
      await queryDb(deleteQuery, [foodid, pvarientid]);

      // Insert new item details into the database
      for (let item of itemdetails) {
        const { p_id, quantity } = item;

        if (!quantity || !p_id) {
          return res.status(400).json({ message: 'Invalid item details provided' });
        }

        const insertSql = `
          INSERT INTO production_details (foodid, pvarientid, ingredientid, qty, createdby, created_date)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        console.log("Inserting for p_id:", p_id, "with quantity:", quantity); // Debug log

        // Insert new data into the database
        await queryDb(insertSql, [
          foodid,
          pvarientid,
          p_id,
          quantity,
          createdby,
          created_date
        ]);
      }
    }

    // Commit the transaction if all operations are successful
    await queryDb('COMMIT');

    return res.status(200).json({ success: true, message: 'Production details updated successfully' });
  } catch (err) {
    console.error('Error in updateProductionDetail:', err);
    
    // Rollback the transaction in case of an error
    await queryDb('ROLLBACK');
    
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


const getProductionDetails = async (req, res) => {
  const { searchItem } = req.query;
  
  let productionDetailsQuery = `
    SELECT 
      f.ProductName AS food_name, f.ProductsID, p.itemquantity,
      v.variantName AS variant_name, p.saveddate, p.productionexpiredate
    FROM 
      production p
    LEFT JOIN 
      item_foods f ON p.itemid = f.ProductsID
    LEFT JOIN 
      variant v ON p.itemvid = v.variantid
  `;

  if (searchItem) {
    productionDetailsQuery += `
      WHERE f.ProductName LIKE ? OR v.variantName LIKE ? OR p.saveddate LIKE ? OR p.productionexpiredate LIKE ?
    `;
  }

  productionDetailsQuery += ` ORDER BY p.productionid DESC`;

  try {
    const params = searchItem ? [`%${searchItem}%`, `%${searchItem}%`, `%${searchItem}%`,`%${searchItem}%`] : [];
    const productionDetails = await dbQuery(productionDetailsQuery, params);

    // Check if any data was found
    if (!productionDetails || productionDetails.length === 0) {
      return res.status(404).json({ message: 'Production details not found!' });
    }

    // Respond with the fetched data
    return res.status(200).json({ success: true, data: productionDetails });
  } catch (err) {
    console.error('Error fetching production details:', err);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching production details' });
  }
};



module.exports = {
  getalldetailsProductiondetails,
  foodWithVariant,
  foodNameFetchApi,
  createProduction,
  getPurchaseTransactions,
  getAllStockIngredients,
  getPerItemPrice,
  createproduction,
  findbyIdProductiondetails,  
  updateProductionDetail,
  getProductionDetails,
  getAllStockIngredientswithone,
  viewProductiondetails
};
