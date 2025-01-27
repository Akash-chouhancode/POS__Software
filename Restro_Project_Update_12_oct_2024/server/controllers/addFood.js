const db = require("../utils/db");
const fs = require("fs");
const path = require("path");

const createItemFood = (req, res) => {
  const {
    CategoryID,
    kitchenid,
    ProductName,
    descrp,
    productvat,
    special,
    isoffer,
    offerstartdate,
    offerenddate,
    is_custom_quantity,
    status,
    menuid,
    variant, // This should be an array of objects with price and variantName
    addons, // This should be an array of addon IDs
  } = req.body;
const UserIDInserted=req.id;
  const ProductImage = req.file ? req.file.filename : null;
  const isofferint = isoffer === "true" ? 1 : 0;
  const is_custom_quantityint = is_custom_quantity === "true" ? 1 : 0;
  const specialint = special === "true" ? 1 : 0;

  console.log("Received fields:", req.body);
  console.log("Received file:", req.file);

  // Parse variant and addons if they are JSON strings
  const parsedVariant = JSON.parse(variant || "[]");
  const parsedAddons = JSON.parse(addons || "[]");

  // Insert into item_foods
  const sql1 = `INSERT INTO item_foods(CategoryID,UserIDInserted, kitchenid, ProductName, descrip, ProductImage, productvat, special, offerIsavailable, offerstartdate, offerendate, is_customqty, ProductsIsActive, menutype) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  const values1 = [
    CategoryID,
    UserIDInserted,
    kitchenid,
    ProductName,
    descrp,
    ProductImage,
    productvat,
    specialint,
    isofferint,
    offerstartdate,
    offerenddate,
    is_custom_quantityint,
    status,
    menuid,
  ];

  db.pool.query(sql1, values1, (err, result1) => {
    if (err) {
      console.error("Error inserting into item_foods:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err });
    }

    const insertedItemId = result1.insertId;

    // Insert into variant
    const sql2 = `INSERT INTO variant(menuid, price, variantName) VALUES (?, ?, ?)`;

    // Check if parsedVariant is an array and map over it
    const variantPromises = Array.isArray(parsedVariant)
      ? parsedVariant.map(({ price, variantName }) => {
          const values2 = [insertedItemId, price, variantName];
          return new Promise((resolve, reject) => {
            db.pool.query(sql2, values2, (err, result2) => {
              if (err) {
                console.error("Error inserting into variant:", err);
                reject(err);
              } else {
                resolve(result2);
              }
            });
          });
        })
      : [];

    // Insert into Assign_menu_addon
    const sql3 = `INSERT INTO menu_add_on (menu_id, add_on_id,is_active) VALUES (?, ?,1)`;

    // Check if parsedAddons is an array and map over it
    const addonPromises = Array.isArray(parsedAddons)
      ? parsedAddons.map((addon_id) => {
          const values3 = [insertedItemId, addon_id];
          return new Promise((resolve, reject) => {
            db.pool.query(sql3, values3, (err, result3) => {
              if (err) {
                console.error("Error inserting into menu_addon:", err);
                reject(err);
              } else {
                resolve(result3);
              }
            });
          });
        })
      : [];

    // Execute all variant and addon insertions
    Promise.all([...variantPromises, ...addonPromises])
      .then(() => {
        res.status(201).json({
          message: "Product, variants, and addons created successfully",
        });
      })
      .catch((err) => {
        console.error("Error inserting variants or addons:", err);
        res.status(500).json({ error: "Internal Server Error", details: err });
      });
  });
};

const getAllItemFoodDetails = async (req, res) => {
  const { searchItem } = req.query;
  let sql = `
    SELECT
      item_foods.*,
      item_category.*,
      tbl_kitchen.*,
      tbl_menutype.*
    FROM
      item_foods
    LEFT JOIN item_category ON item_foods.CategoryID = item_category.CategoryID
    LEFT JOIN tbl_kitchen ON item_foods.kitchenid = tbl_kitchen.kitchenid
    LEFT JOIN tbl_menutype ON item_foods.menutype = tbl_menutype.menutypeid
    WHERE
      item_foods.ProductsIsActive = 1
     
  `;

  let params = [];

  if (searchItem) {
      sql += `
        AND (
          item_foods.ProductName LIKE ?
          OR item_category.Name LIKE ?
        )
      `;
      params = [`%${searchItem}%`, `%${searchItem}%`];
  }

  sql += ` ORDER BY item_foods.ProductsID DESC`;
  ;

  try {
      // Fetch the main product details
      const products = await new Promise((resolve, reject) => {
          db.pool.query(sql, params, (err, results) => {
              if (err) {
                  console.error("Error fetching details:", err);
                  reject(err);
              } else {
                  resolve(results);
              }
          });
      });

      if (products.length === 0) {
          return res.status(404).json({ error: "No details found" });
      }

      // Fetch the variants for each product
      const productsWithDetails = await Promise.all(
          products.map(async (product) => {
              const variants = await new Promise((resolve, reject) => {
                  const queryVariants = `
                    SELECT v.*
                    FROM variant v
                    WHERE v.menuid = ?;
                  `;
                  db.pool.query(queryVariants, [product.productsID], (err, result) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(result || []);
                      }
                  });
              });

              return {
                  ...product,
                  variants,
              };
          })
      );

      // Respond with the array of combined product and variant data
      res.status(200).json(productsWithDetails);
  } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal Server Error", details: err });
  }
};




const deleteItemFood = (req, res) => {
  const ProductsID = req.params.ProductsID; // Extract ProductsID from URL params

  // First fetch the ProductImage filename from item_foods
  const sqlFetchImage = `SELECT ProductImage FROM item_foods WHERE ProductsID = ?`;
  db.pool.query(sqlFetchImage, [ProductsID], (err, result) => {
    if (err) {
      console.error("Error fetching ProductImage:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err });
    }

    // Check if a record with ProductsID exists
    if (result.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const imageFilename = result[0].ProductImage;

    const sqlDeleteItemFood = `DELETE FROM item_foods WHERE ProductsID = ?`;
    db.pool.query(sqlDeleteItemFood, [ProductsID], (err, result) => {
      if (err) {
        console.error("Error deleting item_food:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: err });
      }

      // If there was a ProductImage associated, delete the image file
      if (imageFilename) {
        const imagePath = path.join(
          __dirname,
          "../asset/category",
          imageFilename
        );
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting image file:", unlinkErr);
              return res
                .status(500)
                .json({ error: "Internal Server Error", details: unlinkErr });
            }
            return res.json({
              message: "Product and image file deleted successfully",
            });
          });
        } else {
          // Image file not found, still consider deletion successful
          return res.json({
            message: "Product  deleted successfully, image file not found",
          });
        }
      } else {
        // No image associated, return success message
        return res.json({
          message: "Product  deleted successfully, no associated image",
        });
      }
    });
  });
};

const getItemFoodDetails = (req, res) => {
  const ProductsID = req.params.ProductID;

  // Query to fetch product details
  const productDetailsQuery = `
    SELECT
      item_foods.*,
      item_category.*,
      tbl_kitchen.*,
      tbl_menutype.*
    FROM
      item_foods
    LEFT JOIN item_category ON item_foods.CategoryID = item_category.CategoryID
    LEFT JOIN tbl_kitchen ON item_foods.kitchenid = tbl_kitchen.kitchenid
    LEFT JOIN tbl_menutype ON item_foods.menutype = tbl_menutype.menutypeid
    WHERE
      item_foods.ProductsIsActive = 1 AND item_foods.ProductsID = ?;
  `;

  // Query to fetch add-ons data
  const addonsQuery = `
    SELECT
      menu_add_on.add_on_id,
      add_ons.price AS addOn_price,
      add_ons.add_on_name
    FROM
      menu_add_on
    LEFT JOIN add_ons ON menu_add_on.add_on_id = add_ons.add_on_id
    WHERE
      menu_add_on.is_active = 1 AND menu_add_on.menu_id = ?;
  `;

  // Query to fetch variants data
  const variantsQuery = `
    SELECT
      variant.*
    FROM
      variant
    WHERE
      variant.menuid = ?;
  `;

  // Execute all queries concurrently
  Promise.all([
    new Promise((resolve, reject) => {
      db.pool.query(productDetailsQuery, [ProductsID], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.pool.query(addonsQuery, [ProductsID], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.pool.query(variantsQuery, [ProductsID], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    }),
  ])
    .then(([productDetails, addons, variants]) => {
      if (productDetails.length === 0) {
        return res.status(404).json({ error: "No product details found" });
      }

      res.status(200).json({
        productDetails: productDetails[0], // Assuming you want to return the first product detail
        addons: addons.length > 0 ? addons : [], // If no addons, return an empty array
        variants: variants.length > 0 ? variants : [], // If no variants, return an empty array
      });
    })
    .catch((error) => {
      console.error("Error fetching details:", error);
      res.status(500).json({ error: "Internal Server Error", details: error });
    });
};

// update Food

const updateItemFood = (req, res) => {
  const {
    CategoryID,
    kitchenid,
    ProductName,
    descrp,
    productvat,
    special,
    isoffer,
    offerstartdate,
    offerenddate,
    is_custom_quantity,
    status,
    menuid,
    variant, // This should be a JSON string of an array of objects
    addons, // This should be a comma-separated string of addon IDs
  } = req.body;
const UserIDUpdated=req.id
  const ProductsID = req.params.ProductID;
  const ProductImage = req.file ? req.file.filename : null;

  const isofferint = isoffer === "true" ? 1 : 0;
  const is_custom_quantityint = is_custom_quantity === "true" ? 1 : 0;
  const specialint = special === "true" ? 1 : 0;

  console.log("Received fields:", req.body);
  console.log("Received file:", req.file);

  // Convert variant JSON string to an array of objects
  let parsedVariants = [];
  try {
    parsedVariants = JSON.parse(variant);
  } catch (error) {
    console.error("Error parsing variants:", error);
    return res.status(400).json({ error: "Invalid variant data" });
  }

  // Convert comma-separated addons string to an array
  const parsedAddons = addons ? addons.split(',') : [];

  // Fetch existing item_food data
  const sqlFetch = `SELECT * FROM item_foods WHERE ProductsID = ?`;
  db.pool.query(sqlFetch, [ProductsID], (err, existingData) => {
    if (err) {
      console.error("Error fetching existing item_food data:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err });
    }

    if (existingData.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingItem = existingData[0];

    // Use existing data as default for missing fields
    const updatedCategoryID =
      CategoryID !== undefined ? CategoryID : existingItem.CategoryID;
    const updatedKitchenid =
      kitchenid !== undefined ? kitchenid : existingItem.kitchenid;
    const updatedProductName =
      ProductName !== undefined ? ProductName : existingItem.ProductName;
    const updatedDescrp = descrp !== undefined ? descrp : existingItem.descrip;
    const updatedProductImage =
      ProductImage !== null ? ProductImage : existingItem.ProductImage;
    const updatedProductvat =
      productvat !== undefined ? productvat : existingItem.productvat;
    const updatedSpecial =
      special !== undefined ? specialint : existingItem.special;
    const updatedIsOffer =
      isoffer !== undefined ? isofferint : existingItem.offerIsavailable;
    const updatedOfferStartDate =
      offerstartdate !== undefined
        ? offerstartdate
        : existingItem.offerstartdate;
    const updatedOfferEndDate =
      offerenddate !== undefined ? offerenddate : existingItem.offerendate;
    const updatedIsCustomQuantity =
      is_custom_quantity !== undefined
        ? is_custom_quantityint
        : existingItem.is_customqty;
    const updatedStatus =
      status !== undefined ? status : existingItem.ProductsIsActive;
    const updatedMenuid = menuid !== undefined ? menuid : existingItem.menutype;

    // Update item_foods
    const sql1 = `UPDATE item_foods
                    SET CategoryID = ?,UserIDUpdated = ?, kitchenid = ?, ProductName = ?, descrip = ?, ProductImage = ?, productvat = ?, special = ?, offerIsavailable = ?, offerstartdate = ?, offerendate = ?, is_customqty = ?, ProductsIsActive = ?, menutype = ?
                    WHERE ProductsID = ?`;
    const values1 = [
      updatedCategoryID,
      UserIDUpdated,
      updatedKitchenid,
      updatedProductName,
      updatedDescrp,
      updatedProductImage,
      updatedProductvat,
      updatedSpecial,
      updatedIsOffer,
      updatedOfferStartDate,
      updatedOfferEndDate,
      updatedIsCustomQuantity,
      updatedStatus,
      updatedMenuid,
      ProductsID,
    ];

    db.pool.query(sql1, values1, (err, result1) => {
      if (err) {
        console.error("Error updating item_foods:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: err });
      }

      // Remove existing variants
      const sqlDeleteVariants = `DELETE FROM variant WHERE menuid = ?`;
      db.pool.query(sqlDeleteVariants, [ProductsID], (err) => {
        if (err) {
          console.error("Error deleting existing variants:", err);
          return res
            .status(500)
            .json({ error: "Internal Server Error", details: err });
        }

        // Insert new variants
        if (parsedVariants.length > 0) {
          const sql2 = `INSERT INTO variant (menuid, price, variantName) VALUES (?, ?, ?)`;
          const variantPromises = parsedVariants.map(({ price, variantName }) => {
            const values2 = [ProductsID, price, variantName];
            return new Promise((resolve, reject) => {
              db.pool.query(sql2, values2, (err, result2) => {
                if (err) {
                  console.error("Error inserting into variant:", err);
                  reject(err);
                } else {
                  resolve(result2);
                }
              });
            });
          });

          Promise.all(variantPromises)
            .then(() => {
              console.log("New variants added successfully");
            })
            .catch((err) => {
              console.error("Error inserting variants:", err);
              return res
                .status(500)
                .json({ error: "Internal Server Error", details: err });
            });
        }

        // Remove existing add-ons
        const sqlDeleteAddons = `DELETE FROM menu_add_on WHERE menu_id = ?`;
        db.pool.query(sqlDeleteAddons, [ProductsID], (err) => {
          if (err) {
            console.error("Error deleting existing add-ons:", err);
            return res
              .status(500)
              .json({ error: "Internal Server Error", details: err });
          }

          // Insert new add-ons
          if (parsedAddons.length > 0) {
            const sql3 = `INSERT INTO menu_add_on (menu_id, add_on_id, is_active) VALUES (?, ?, 1)`;
            const addonPromises = parsedAddons.map((addon_id) => {
              const values3 = [ProductsID, addon_id];
              return new Promise((resolve, reject) => {
                db.pool.query(sql3, values3, (err, result3) => {
                  if (err) {
                    console.error("Error inserting into menu_add_on:", err);
                    reject(err);
                  } else {
                    resolve(result3);
                  }
                });
              });
            });

            Promise.all(addonPromises)
              .then(() => {
                console.log("New add-ons added successfully");
                res.status(200).json({
                  message:
                    "Product updated successfully with any new variants and add-ons",
                });
              })
              .catch((err) => {
                console.error("Error inserting add-ons:", err);
                return res
                  .status(500)
                  .json({ error: "Internal Server Error", details: err });
              });
          } else {
            // If no new add-ons, complete the response
            res.status(200).json({
              message:
                "Product updated successfully with any new variants",
            });
          }
        });
      });
    });
  });
};

module.exports = {
  createItemFood,
  getAllItemFoodDetails,
  deleteItemFood,
  getItemFoodDetails,
  updateItemFood,
};
