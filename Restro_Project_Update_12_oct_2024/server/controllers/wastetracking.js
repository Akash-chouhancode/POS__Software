const db = require("../utils/db");
const dbQuery = (query, values) => {
    return new Promise((resolve, reject) => {
      db.pool.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  };

  const getPackagingWasteDetails = async (req, res) => {
    const { from, to, searchItem } = req.query; 
   
    try {
      // Base SQL query to get packaging food waste details along with ingredient name
      let getWasteDetailsQuery = `
        SELECT 
          pfw.order_id,
          pfw.id,
          pfw.ingradient_id,
          pfw.qnty,
          pfw.l_price,
          pfw.note,
          pfw.created_at,
          ing.ingredient_name
        FROM packaging_food_waste pfw
        INNER JOIN ingredients ing ON pfw.ingradient_id = ing.id
      `;
  
      let queryParams = [];
      let whereConditions = [];
  
      // Date filtering condition
      if (from && to) {
        whereConditions.push(`pfw.created_at BETWEEN ? AND ?`);
        queryParams.push(from, to);
      }
  
      // Search filtering condition for all relevant columns
      if (searchItem) {
        const searchValue = `%${searchItem}%`; // Wildcard for partial match
        whereConditions.push(`
          (pfw.order_id LIKE ? 
          OR pfw.ingradient_id LIKE ?
          OR pfw.qnty LIKE ?
          OR pfw.l_price LIKE ?
          OR pfw.note LIKE ?
          OR pfw.created_at LIKE ?
          OR ing.ingredient_name LIKE ?)
        `);
        queryParams.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
      }
  
      // If there are conditions, add them to the query
      if (whereConditions.length > 0) {
        getWasteDetailsQuery += ` WHERE ` + whereConditions.join(' AND ');

      }
  
      getWasteDetailsQuery+=` ORDER BY pfw.id DESC`
    
      const wasteDetails = await dbQuery(getWasteDetailsQuery, queryParams);
  
      // If no records found, send 404 response
      if (wasteDetails.length === 0) {
        return res.status(404).send({ message: 'No packaging food waste records found' });
      }
  
      // Send the result back in response
      res.status(200).send({ data: wasteDetails });
    } catch (error) {
      console.error("Error fetching packaging waste details:", error);
      res.status(500).send({ message: 'Server error', error });
    }
  };


  const insertPackageInformation = async (req, res) => {
    const { orderdetails, itemdetails } = req.body;
    const { orderid } = orderdetails[0];
    const saveid = req.id;
    const newDate = new Date().toISOString().slice(0, 10); // Format date as 'YYYY-MM-DD'
  
    try {
      // Check if the order already exists in packaging_food_waste
      const checkWasteQuery = `SELECT * FROM packaging_food_waste WHERE order_id = ?`;
      const wasteResult = await dbQuery(checkWasteQuery, [orderid]);
  
      if (wasteResult.length > 0) {
        return res.status(400).send('The order is already exists');
      }
  
      // Check if the order exists in customer_order for the current date
      const checkOrderQuery = `SELECT order_id FROM customer_order WHERE order_id = ? AND order_date = ?`;
      const orderResult = await dbQuery(checkOrderQuery, [orderid, newDate]);
  
      const orderCount = orderResult.length;
      if (orderCount !== 1) {
        return res.status(400).send('Order not found for the current date');
      }
  
      // Loop through itemdetails and insert each product's information
      for (let index = 0; index < itemdetails.length; index++) {
        const { ingradient_id, qnty, l_price, note } = itemdetails[index];
        const finallostprice = qnty * l_price;
  
        const data1 = {
          order_id: orderid,
          ingradient_id: ingradient_id,
          qnty: qnty,
          l_price: finallostprice,
          note: note,
          createdby: saveid,
          created_at: newDate
        };
  
        // Update stock quantity in ingredients table
        const updateStockQuery = `UPDATE ingredients SET stock_qty = stock_qty - ? WHERE id = ?`;
        await dbQuery(updateStockQuery, [qnty, ingradient_id]);
  
        // Insert data into packaging_food_waste table
        const insertWasteQuery = `INSERT INTO packaging_food_waste SET ?`;
        await dbQuery(insertWasteQuery, data1);
      }
  
      // All items processed, send success response
      return res.status(200).send('Packaging information inserted successfully');
  
    } catch (err) {
      console.error('Error processing request:', err);
      return res.status(500).send('Server error');
    }
  };

  const getPackageFoodWasteDetails = async (req, res) => {
    const { start_date, end_date, searchItem } = req.query; // Extract start_date, end_date, and searchItem from query parameters
  
    let query = `
      SELECT ingradient_food_waste.*, ingredients.ingredient_name, 
             CONCAT_WS(' ', user.firstname, user.lastname) AS Checkedby
      FROM ingradient_food_waste
      JOIN ingredients ON ingradient_food_waste.ingradient_id = ingredients.id
      JOIN user ON ingradient_food_waste.check_by = user.id
    `;
    let queryParams = [];
    let whereConditions = [];
  
    // Date filtering condition (if start_date and end_date are provided)
    if (start_date && end_date) {
      whereConditions.push(`ingradient_food_waste.created_at BETWEEN ? AND ?`);
      queryParams.push(start_date, end_date);
    }
  
    // Search filtering condition for relevant columns
    if (searchItem) {
      const searchValue = `%${searchItem}%`; // Wildcard for partial match
      whereConditions.push(`
        (ingradient_food_waste.id LIKE ?
        OR ingredients.ingredient_name LIKE ?
        OR user.firstname LIKE ?
        OR ingradient_food_waste.l_price LIKE ?
        OR user.lastname LIKE ?
        OR ingradient_food_waste.note LIKE ?
        OR ingradient_food_waste.qnty LIKE ?
        OR ingradient_food_waste.created_at LIKE ?)
      `);
      queryParams.push(searchValue, searchValue,searchValue,searchValue, searchValue, searchValue, searchValue, searchValue);
    }
  
    // If there are conditions, add them to the query
    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }
  
    query += ` ORDER BY ingradient_food_waste.id DESC`;
  
    try {
      // Execute the SQL query
      const results = await dbQuery(query, queryParams);
  
      // If no records found, send 404 response
      if (results.length === 0) {
        return res.status(404).send({ message: 'No ingredient food waste records found' });
      }
  
      // Send the result in response
      res.status(200).json(results);
    } catch (err) {
      console.error('Error fetching ingredient information in food waste:', err);
      res.status(500).send('Server error');
    }
  };

  const getTotalPrice = async (req, res) => {
    const { id } = req.params;
    console.log(id)
  
  
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
      const query2='SELECT stock_qty FROM ingredients WHERE ingredients.id=?'
      const result1 = await dbQuery(query2, [id]);
      const total_stock=result1[0].stock_qty;
      // const l_price=total_stock*pricePerIngredient-qnty*pricePerIngredient;
      
  
      
  
      // Return the result in a response
      return res.status(200).json({
        data: [{ Price: pricePerIngredient ,Stock:total_stock}]
      });
  
    } catch (err) {
      // Handle errors in the database query
      console.error('Error fetching total quantity and price:', err);
      return res.status(500).send('Server error');
    }
  };


  const insertingRdInformation = async (req, res) => {
    const { userdetails, itemdetails } = req.body;
    const { user } = userdetails[0];
    const saveId = req.id;
    const newDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
      // Start a database transaction
      await dbQuery('START TRANSACTION');

      for (let index = 0; index < itemdetails.length; index++) {
        const { ingradientvalue: ingredientId, qnty, l_price, note, quantitystock } = itemdetails[index];

        // Calculate the new stock quantity
        const product_quantity = quantitystock - qnty;

        const data1 = {
          check_by: user,
          ingradient_id: ingredientId,
          qnty: product_quantity,
          l_price: l_price,
          note: note,
          createdby: saveId,
          created_at: newDate,
        };

        // Update stock quantity
        const updateStockQuery = 'UPDATE ingredients SET stock_qty = stock_qty - ? WHERE id = ?';
        await dbQuery(updateStockQuery, [product_quantity, ingredientId]);

        // Insert food waste information
        const insertWasteQuery = 'INSERT INTO ingradient_food_waste SET ?';
        await dbQuery(insertWasteQuery, data1);
      }

      // Commit transaction
      await dbQuery('COMMIT');

      // Send success response
      return res.status(200).send('Ingredient information inserted successfully');
    } catch (err) {
      // Rollback transaction in case of error
      await dbQuery('ROLLBACK');
      console.error('Error inserting ingredient information:', err);
      return res.status(500).send('Server error');
    }
  };


  const showItemsFoodWaste = async (req, res) => {
    const { start_date, end_date, searchItem } = req.query; // Extract start_date, end_date, and searchItem from query parameters
  
    // Base query
    let query = `
      SELECT items_food_waste.*, 
      items_food_waste.qnty,
      items_food_waste.l_price,
      items_food_waste.note,
      items_food_waste.created_at,
             item_foods.ProductName, 
             variant.variantName, 
             CONCAT_WS(' ', user.firstname, user.lastname) AS fullname
      FROM items_food_waste
      LEFT JOIN item_foods ON items_food_waste.itms_id = item_foods.ProductsID
      LEFT JOIN variant ON items_food_waste.wvarientid = variant.variantid
      LEFT JOIN user ON items_food_waste.check_by = user.id
    `;
  
    let queryParams = [];
    let whereConditions = [];
  
    // Date filtering condition (if start_date and end_date are provided)
    if (start_date && end_date) {
      whereConditions.push(`items_food_waste.created_at BETWEEN ? AND ?`);
      queryParams.push(start_date, end_date);
    }
  
    // Search filtering condition for all relevant columns (ProductName, variantName, fullname)
    if (searchItem) {
      const searchValue = `%${searchItem}%`; // Wildcard for partial match
      whereConditions.push(`
        (item_foods.ProductName LIKE ? 
        OR variant.variantName LIKE ?
        OR CONCAT_WS(' ', user.firstname, user.lastname) LIKE ?
        OR  items_food_waste.qnty LIKE ?
         OR  items_food_waste.l_price LIKE ?
       OR items_food_waste.note LIKE ?
      OR items_food_waste.created_at LIKE ?)
      `);
      queryParams.push(searchValue, searchValue,searchValue,searchValue,searchValue,searchValue, searchValue);
    }
  
    // If there are conditions, add them to the query
    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }
  
    // Order by condition (optional)
    query += ` ORDER BY items_food_waste.id DESC`;
  
    try {
      // Execute the SQL query with queryParams
      const results = await dbQuery(query, queryParams);
  
      // If no records found, send 404 response
      if (results.length === 0) {
        return res.status(404).send({ message: 'No food waste records found' });
      }
  
      // Send the result in response
      res.status(200).json({data:results});
    } catch (err) {
      console.error('Error fetching food waste records:', err);
      res.status(500).send('Server error');
    }
  };

  // price accours=din food name and variant 
   const getalldetailsProductiondetails = async (req, res) => {
    const { foodid, pvarientid } = req.query;
  
    try {
      // Step 1: Fetch foodid and pvarientid from production_details
      let foodVariantQuery = `
        SELECT foodid, pvarientid, ingredientid, qty AS productionqty
        FROM production_details 
        WHERE foodid = ? AND pvarientid = ?
      `;
  
      const productionDetails = await dbQuery(foodVariantQuery, [foodid, pvarientid]);
  
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
      const purchaseDetails = await dbQuery(purchaseQuery, [ingredientIds]);
      console.log(purchaseDetails,"indredientid")
  
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
      const foodNameResults = await dbQuery(foodNameQuery, [foodIds]);
  
      const variantNameQuery = `
        SELECT v.variantName, v.variantid 
        FROM variant v 
        WHERE v.variantid IN (?)
      `;
      const variantNameResults = await dbQuery(variantNameQuery, [variantIds]);
  
      const ingredientNameQuery = `
        SELECT id, ingredient_name 
        FROM ingredients 
        WHERE id IN (?)
      `;
      const ingredientNames = await dbQuery(ingredientNameQuery, [ingredientIds]);
  
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
       
        console.log(ingredientPurchaseDetail,"ingredientpurchasedetaiol")
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
  
      // Step 6: Send filtered results
      const filteredResults = Object.values(result);
  
      res.status(200).send({ data: filteredResults });
    } catch (error) {
      console.error("Error fetching production details:", error);
      res.status(500).send({ message: 'Server Error', error });
    }
  };
  // post maing food waste 
  const insertFoodInformation = async (req, res) => {
    const { userdetails, itemdetails } = req.body;
    const { user } = userdetails[0]; // Assuming userdetails[0] has the user property
  
    const saveid = req.id; // Assuming session is managed in req.session
    const newDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format date as 'YYYY-MM-DD HH:mm:ss'
  
    try {
      for (let index = 0; index < itemdetails.length; index++) {
        const { itms_id, wvarientid, qnty, l_price, note } = itemdetails[index];
        
        // Construct the data to be inserted
        const data1 = {
          check_by: user,             // From userdetails
          itms_id: itms_id,           // Product ID from itemdetails
          wvarientid: wvarientid,     // Variant ID from itemdetails
          qnty: qnty,                 // Quantity from itemdetails
          l_price: l_price,           // Lost price from itemdetails
          note: note,                 // Note from itemdetails
          createdby: saveid,          // Assuming session ID or creator ID
          created_at: newDate         // Timestamp
        };
  
        // Insert data into the 'items_food_waste' table
        const insertWasteQuery = `INSERT INTO items_food_waste SET ?`;
        await dbQuery(insertWasteQuery, data1);
  

      }
  
      return res.status(200).send('Food information inserted successfully');
    } catch (err) {
      console.error('Error processing request:', err);
      return res.status(500).send('Server error');
    }
  };

  
  
   module.exports={
    getPackagingWasteDetails,
    insertPackageInformation,
    getPackageFoodWasteDetails,
    getTotalPrice,
    insertingRdInformation,
    showItemsFoodWaste,
    getalldetailsProductiondetails,
    insertFoodInformation
   }