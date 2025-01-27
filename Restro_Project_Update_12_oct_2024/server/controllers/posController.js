const db = require("../utils/db");

// get Category

const getCategoryList = async (req, res) => {
  try {
    const getCategoryListQuery = `
      SELECT
        parent.CategoryID AS parentCategoryID,
        parent.Name AS parentCategoryName,
        parent.CategoryIsActive AS parentCategoryIsActive,
        parent.parentid AS parentParentID,
        child.CategoryID AS childCategoryID,
        child.Name AS childCategoryName,
        child.CategoryIsActive AS childCategoryIsActive,
        child.parentid AS childParentID
      FROM
        item_category parent
       LEFT JOIN
        item_category child ON child.parentid = parent.CategoryID
      WHERE
        parent.parentid = 0
        AND parent.CategoryIsActive = 1
        AND (child.CategoryIsActive = 1 OR child.CategoryID IS NULL)
      ORDER BY
        parent.CategoryID, child.CategoryID;
    `;

    db.pool.query(getCategoryListQuery, (err, results) => {
      if (err) {
        console.error("Error fetching category list:", err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        const categoryMap = {};

        results.forEach((row) => {
          const parentID = row.parentCategoryID;
          if (!categoryMap[parentID]) {
            categoryMap[parentID] = {
              CategoryID: row.parentCategoryID,
              CategoryName: row.parentCategoryName,
              CategoryIsActive: row.parentCategoryIsActive,
              ParentID: row.parentParentID,
              children: [],
            };
          }
          if (row.childCategoryID) {
            categoryMap[parentID].children.push({
              CategoryID: row.childCategoryID,
              CategoryName: row.childCategoryName,
              CategoryIsActive: row.childCategoryIsActive,
              ParentID: row.childParentID,
            });
          }
        });

        const categoryList = Object.values(categoryMap);
        res.status(200).json({
          success: true,
          data: categoryList,
          message: "Category list fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error in getCategoryList:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

/// get products by category id
// get products by category id
const getProductsByCategory = async (req, res) => {
  const categoryId = req.query.categoryId;
  const searchTerm = req.query.searchTerm || ""; // If no search term is provided, default to an empty string.
  console.log(req.params.searchTerm, searchTerm);
  let queryProducts;
  let params = [];

  if (categoryId) {
    queryProducts = `
      SELECT f.*, m.*, k.kitchen_name, p.*
      FROM item_foods f
      LEFT JOIN tbl_menutype m ON f.menutype = m.menutypeid
      LEFT JOIN tbl_kitchen k ON f.kitchenid = k.kitchenid
      LEFT JOIN printers p ON k.printer_id = p.id
      WHERE f.CategoryID = ? AND f.ProductsIsActive = 1
    `;
    params.push(categoryId);
  } else {
    queryProducts = `
      SELECT f.*, m.*, k.kitchen_name, p.*
      FROM item_foods f
      LEFT JOIN tbl_menutype m ON f.menutype = m.menutypeid
      LEFT JOIN tbl_kitchen k ON f.kitchenid = k.kitchenid
      LEFT JOIN printers p ON k.printer_id = p.id
      WHERE f.ProductsIsActive = 1
    `;
  }

  // If a search term is provided, add it to the query
  if (searchTerm) {
    queryProducts += ` AND (f.ProductName LIKE ? OR f.descrip LIKE ?)`;
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    console.log(searchTerm);
  }

  try {
    // Query to fetch products with menutype
    const products = await new Promise((resolve, reject) => {
      db.pool.query(queryProducts, params, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    // Loop through each product to fetch related add-ons and variants
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Query to fetch variants
        const variants = await new Promise((resolve, reject) => {
          const queryVariants = `
          SELECT v.*
          FROM variant v
          WHERE v.menuid = ?;
        `;
          db.pool.query(queryVariants, [product.ProductsID], (err, results) => {
            if (err) reject(err);
            resolve(results || []);
          });
        });

        // Query to fetch add-ons
        const addons = await new Promise((resolve, reject) => {
          const queryAddons = `
          SELECT a.*
          FROM menu_add_on ma
          LEFT JOIN add_ons a ON ma.add_on_id = a.add_on_id
          WHERE ma.is_active = 1 AND ma.menu_id = ?;
        `;
          db.pool.query(queryAddons, [product.ProductsID], (err, results) => {
            if (err) reject(err);
            resolve(results || []);
          });
        });

        return {
          ...product,
          variants,
          addons,
        };
      })
    );

    // Respond with the array of combined product and variant data
    res.status(200).json(productsWithDetails);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// const orderPlace = (req, res) => {
//   const {
//     customer_id,
//     customer_type,
//     waiter_id,
//     order_details,
//     grand_total,
//     service_charge,
//     VAT,
//     discount,
//     table_id,
//   } = req.body;

//   if (
//     !customer_id ||
//     !order_details ||
//     !Array.isArray(order_details) ||
//     !grand_total
//   ) {
//     return res.status(400).json({ message: "Invalid request data" });
//   }

//   // Ensure waiter_id and table_id default to 0 if not provided
//   const waiterId = waiter_id || 0;
//   const tableId = table_id || 0;

//   // Get the max order ID
//   const maxOrderIdQuery =
//     "SELECT MAX(order_id) AS maxOrderId FROM customer_order";
//   db.pool.query(maxOrderIdQuery, (err, result) => {
//     if (err) {
//       console.error("Error getting max order ID:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }

//     const maxOrderId = result[0].maxOrderId;
//     const invoiceId = maxOrderId ? maxOrderId + 1 : 1;

//     const isthirdparty = customer_type === 3 ? 3 : 0;

//     const orderQuery = `INSERT INTO customer_order(saleinvoice, customer_id, cutomertype, isthirdparty, waiter_id, order_date, order_time, table_no, totalamount, order_status, orderacceptreject, splitpay_status)
//                           VALUES (?, ?, ?, ?, ?, NOW(), CURTIME(), ?, ?, 2, 1, 0)`;
//     db.pool.query(
//       orderQuery,
//       [
//         invoiceId,
//         customer_id,
//         customer_type,
//         isthirdparty,
//         waiterId,
//         tableId,
//         grand_total,
//       ],
//       (err, result) => {
//         if (err) {
//           console.error("Error inserting order:", err);
//           return res.status(500).json({ message: "Internal server error" });
//         }

//         const orderId = result.insertId;

//         const orderDetailsQuery =
//           "INSERT INTO order_menu(order_id, menu_id, price, menuqty, add_on_id, addonsqty, varientid, food_status, allfoodready) VALUES ?";
//         const orderDetailsData = order_details.map((detail) => {
//           const addOnIds = detail.addons
//             .map((addon) => addon.add_on_id)
//             .join(",");
//           const addOnQuantities = detail.addons
//             .map((addon) => addon.add_on_quantity)
//             .join(",");

//           return [
//             orderId,
//             detail.ProductsID,
//             detail.price,
//             detail.quantity,
//             addOnIds,
//             addOnQuantities,
//             detail.variantid,
//             0, // food_status
//             0, // allfoodready
//           ];
//         });

//         db.pool.query(orderDetailsQuery, [orderDetailsData], (err, result) => {
//           if (err) {
//             console.error("Error inserting order details:", err);
//             return res.status(500).json({ message: "Internal server error" });
//           }

//           // Update the table status to 1 (booked)
//           const updateTableStatusQuery =
//             "UPDATE rest_table SET status = 1 WHERE tableid = ?";
//           db.pool.query(updateTableStatusQuery, [table_id], (err, result) => {
//             if (err) {
//               console.error("Error updating table status:", err);
//               return res.status(500).json({ message: "Internal server error" });
//             }

//             const total_amount = grand_total - service_charge - VAT - discount;

//             let shipping_type;
//             switch (customer_type) {
//               case 1:
//                 shipping_type = 3;
//                 break;
//               case 2:
//                 shipping_type = 1;
//                 break;
//               case 3:
//                 shipping_type = 1;
//                 break;
//               case 99:
//                 shipping_type = 1;
//                 break;
//               case 4:
//                 shipping_type = 2;
//                 break;
//               default:
//                 shipping_type = null;
//             }

//             // Insert into bill table
//             const invoiceQuery =
//               "INSERT INTO bill (customer_id, order_id, total_amount, discount, service_charge, shipping_type, VAT, bill_amount, bill_date, bill_time, create_at, bill_status, payment_method_id, create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), CURTIME(), NOW(), 0, 0, NOW())";
//             const bill_data = [
//               customer_id,
//               orderId,
//               total_amount,
//               discount,
//               service_charge || 0.0,
//               shipping_type,
//               VAT || 0.0,
//               grand_total,
//             ];

//             db.pool.query(invoiceQuery, bill_data, (err, result) => {
//               if (err) {
//                 console.error("Error inserting invoice:", err);
//                 return res
//                   .status(500)
//                   .json({ message: "Internal server error" });
//               }

//               if (customer_type == 1 || customer_type == 99) {
//                 // Insert into table_details for customer_type 1 or 99
//                 const additionalQuery =
//                   "INSERT INTO table_details(table_id, customer_id, order_id, time_enter, created_at) VALUES (?, ?, ?, CURTIME(), NOW())";
//                 const additionalData = [table_id, customer_id, orderId];
//                 db.pool.query(additionalQuery, additionalData, (err, result) => {
//                   if (err) {
//                     console.error("Error inserting table data:", err);
//                     return res
//                       .status(500)
//                       .json({ message: "Internal server error" });
//                   }
//                 });
//               }

//               // Fetch the inserted customer_order data with additional information
//               const fetchCustomerOrderDataQuery = `
//                 SELECT co.*, c.customer_name,
//                   w.firstname AS waiter_first_name,
//                   w.lastname AS waiter_last_name,
//                   ct.customer_type AS customer_type_name,
//                   CASE co.order_status
//                           WHEN 1 THEN 'Pending'
//                           WHEN 2 THEN 'Processing'
//                           WHEN 3 THEN 'Ready'
//                           WHEN 4 THEN 'Served'
//                           WHEN 5 THEN 'Cancel'
//                         END as order_status_name
//                 FROM customer_order co
//                 LEFT JOIN customer_info c ON co.customer_id = c.customer_id
//                 LEFT JOIN customer_type ct ON co.cutomertype = ct.customer_type_id
//                 LEFT JOIN user w ON co.waiter_id = w.id

//                 WHERE co.order_id = ?`;
//               db.pool.query(
//                 fetchCustomerOrderDataQuery,
//                 [orderId],
//                 (err, customerOrderData) => {
//                   if (err) {
//                     console.error("Error fetching customer order data:", err);
//                     return res
//                       .status(500)
//                       .json({ message: "Internal server error" });
//                   }

//                   // Fetch the inserted order_menu data with additional information
//                   const fetchOrderMenuDataQuery = `
//                     SELECT om.*,
//                         f.ProductName,
//                         a.add_on_id,
//                         a.add_on_name,
//                         a.price AS addons_price,
//                         v.variantName,
//                         om.addonsqty
//                     FROM order_menu om
//                     LEFT JOIN item_foods f ON om.menu_id = f.ProductsID
//                     LEFT JOIN add_ons a ON FIND_IN_SET(a.add_on_id, om.add_on_id)
//                     LEFT JOIN variant v ON om.varientid = v.variantid
//                     WHERE om.order_id = ?
//                     ORDER BY om.row_id, FIND_IN_SET(a.add_on_id, om.add_on_id)`;
//                   db.pool.query(
//                     fetchOrderMenuDataQuery,
//                     [orderId],
//                     (err, rawOrderMenuData) => {
//                       if (err) {
//                         console.error("Error fetching order menu data:", err);
//                         return res
//                           .status(500)
//                           .json({ message: "Internal server error" });
//                       }

//                       // Process the raw order menu data to group add-ons
//                       const orderMenuData = [];
//                       const orderMenuMap = {};

//                       rawOrderMenuData.forEach((row) => {
//                         if (!orderMenuMap[row.row_id]) {
//                           orderMenuMap[row.row_id] = {
//                             row_id: row.row_id,
//                             order_id: row.order_id,
//                             menu_id: row.menu_id,
//                             ProductName: row.ProductName,
//                             price: row.price,
//                             groupmid: row.groupmid,
//                             notes: row.notes,
//                             menuqty: row.menuqty,
//                             add_on_id: row.add_on_id,
//                             addonsqty: row.addonsqty,
//                             varientid: row.varientid,
//                             groupvarient: row.groupvarient,
//                             addonsuid: row.addonsuid,
//                             qroupqty: row.qroupqty,
//                             isgroup: row.isgroup,
//                             food_status: row.food_status,
//                             allfoodready: row.allfoodready,
//                             isupdate: row.isupdate,
//                             variantName: row.variantName,
//                             addons: [],
//                           };
//                           orderMenuData.push(orderMenuMap[row.row_id]);
//                         }

//                         // Ensure add_on_id and addonsqty are strings before splitting
//                         const addOnIds = String(row.add_on_id).split(",");
//                         const addonQtyArray = String(row.addonsqty).split(",");

//                         addOnIds.forEach((id, index) => {
//                           if (row.add_on_name && row.addons_price) {
//                             orderMenuMap[row.row_id].addons.push({
//                               add_on_id: id,
//                               name: row.add_on_name,
//                               price: row.addons_price,
//                               quantity: addonQtyArray[index],
//                             });
//                           }
//                         });
//                       });

//                       // Fetch the inserted bill data
//                       const fetchBillDataQuery =
//                         "SELECT b.*, sm.shipping_method AS shipping_method_name FROM bill b LEFT JOIN shipping_method sm ON b.shipping_type = sm.ship_id WHERE b.order_id = ?";
//                       db.pool.query(
//                         fetchBillDataQuery,
//                         [orderId],
//                         (err, billData) => {
//                           if (err) {
//                             console.error("Error fetching bill data:", err);
//                             return res
//                               .status(500)
//                               .json({ message: "Internal server error" });
//                           }

//                           res.status(201).json({
//                             message: "Order placed successfully",
//                             orderId,
//                             invoiceId,
//                             customerOrderData: customerOrderData[0],
//                             orderMenuData,
//                             billData: billData[0],
//                           });
//                         }
//                       );
//                     }
//                   );
//                 }
//               );
//             });
//           });
//         });
//       }
//     );
//   });
// };

// get todayOrders

const orderPlace = (req, res) => {
  const {
    customer_id,
    customer_type,
    waiter_id,
    order_details,
    grand_total,
    service_charge,
    VAT,
    discount,
    table_id,
  } = req.body;
  const create_by = req.id;

  if (
    !customer_id ||
    !order_details ||
    !Array.isArray(order_details) ||
    !grand_total
  ) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  // Ensure waiter_id and table_id default to 0 if not provided
  const waiterId = waiter_id || 0;
  const tableId = table_id || 0;

  // Get the max order ID
  const maxOrderIdQuery =
    "SELECT MAX(order_id) AS maxOrderId FROM customer_order";
  db.pool.query(maxOrderIdQuery, (err, result) => {
    if (err) {
      console.error("Error getting max order ID:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const maxOrderId = result[0].maxOrderId;
    const invoiceId = maxOrderId ? maxOrderId + 1 : 1;

    const isthirdparty = customer_type === 3 ? 3 : 0;

    const orderQuery = `INSERT INTO customer_order(saleinvoice, customer_id, cutomertype, isthirdparty, waiter_id, order_date, order_time, table_no, totalamount, order_status, orderacceptreject, splitpay_status)
                          VALUES (?, ?, ?, ?, ?, NOW(), CURTIME(), ?, ?, 2, 1, 0)`;
    db.pool.query(
      orderQuery,
      [
        invoiceId,
        customer_id,
        customer_type,
        isthirdparty,
        waiterId,
        tableId,
        grand_total,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting order:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        const orderId = result.insertId;

        const orderDetailsQuery =
          "INSERT INTO order_menu(order_id, menu_id, price, menuqty, add_on_id, addonsqty, varientid, food_status, allfoodready) VALUES ?";
        const orderDetailsData = order_details.map((detail) => {
          const addOnIds = detail.addons
            .map((addon) => addon.add_on_id)
            .join(",");
          const addOnQuantities = detail.addons
            .map((addon) => addon.add_on_quantity)
            .join(",");

          return [
            orderId,
            detail.ProductsID,
            detail.price,
            detail.quantity,
            addOnIds,
            addOnQuantities,
            detail.variantid,
            0, // food_status
            0, // allfoodready
          ];
        });

        db.pool.query(orderDetailsQuery, [orderDetailsData], (err, result) => {
          if (err) {
            console.error("Error inserting order details:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          // Update the table status to 1 (booked)
          const updateTableStatusQuery =
            "UPDATE rest_table SET status = 1 WHERE tableid = ?";
          db.pool.query(updateTableStatusQuery, [table_id], (err, result) => {
            if (err) {
              console.error("Error updating table status:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            const total_amount = grand_total - service_charge - VAT - discount;

            let shipping_type;
            switch (customer_type) {
              case 1:
                shipping_type = 3;
                break;
              case 2:
                shipping_type = 1;
                break;
              case 3:
                shipping_type = 1;
                break;
              case 99:
                shipping_type = 1;
                break;
              case 4:
                shipping_type = 2;
                break;
              default:
                shipping_type = null;
            }

            // Insert into bill table
            const invoiceQuery =
              "INSERT INTO bill (customer_id,create_by, order_id, total_amount, discount, service_charge, shipping_type, VAT, bill_amount, bill_date, bill_time, create_at, bill_status, payment_method_id, create_date) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, NOW(), CURTIME(), NOW(), 0, 0, NOW())";
            const bill_data = [
              customer_id,
              create_by,
              orderId,
              total_amount,
              discount,
              service_charge || 0.0,
              shipping_type,
              VAT || 0.0,
              grand_total,
            ];

            db.pool.query(invoiceQuery, bill_data, (err, result) => {
              if (err) {
                console.error("Error inserting invoice:", err);
                return res
                  .status(500)
                  .json({ message: "Internal server error" });
              }

              if (customer_type == 1 || customer_type == 99) {
                // Insert into table_details for customer_type 1 or 99
                const additionalQuery =
                  "INSERT INTO table_details(table_id, customer_id, order_id, time_enter, created_at) VALUES (?, ?, ?, CURTIME(), NOW())";
                const additionalData = [table_id, customer_id, orderId];
                db.pool.query(
                  additionalQuery,
                  additionalData,
                  (err, result) => {
                    if (err) {
                      console.error("Error inserting table data:", err);
                      return res
                        .status(500)
                        .json({ message: "Internal server error" });
                    }
                  }
                );
              }

              // Fetch the inserted customer_order data with additional information
              const fetchCustomerOrderDataQuery = `
                SELECT co.*, c.customer_name,
                  w.firstname AS waiter_first_name,
                  w.lastname AS waiter_last_name,
                  ct.customer_type AS customer_type_name,
                  CASE co.order_status
                          WHEN 1 THEN 'Pending'
                          WHEN 2 THEN 'Processing'
                          WHEN 3 THEN 'Ready'
                          WHEN 4 THEN 'Served'
                          WHEN 5 THEN 'Cancel'
                        END as order_status_name
                FROM customer_order co
                LEFT JOIN customer_info c ON co.customer_id = c.customer_id
                LEFT JOIN customer_type ct ON co.cutomertype = ct.customer_type_id
                LEFT JOIN user w ON co.waiter_id = w.id

                WHERE co.order_id = ?`;
              db.pool.query(
                fetchCustomerOrderDataQuery,
                [orderId],
                (err, customerOrderData) => {
                  if (err) {
                    console.error("Error fetching customer order data:", err);
                    return res
                      .status(500)
                      .json({ message: "Internal server error" });
                  }

                  // Fetch the inserted order_menu data with additional information
                  const fetchOrderMenuDataQuery = `
                    SELECT om.*,
                        f.ProductName,
                        a.add_on_id,
                        a.add_on_name,
                        a.price AS addons_price,
                        v.variantName,
                        om.addonsqty
                    FROM order_menu om
                    LEFT JOIN item_foods f ON om.menu_id = f.ProductsID
                    LEFT JOIN add_ons a ON FIND_IN_SET(a.add_on_id, om.add_on_id)
                    LEFT JOIN variant v ON om.varientid = v.variantid
                    WHERE om.order_id = ?
                    ORDER BY om.row_id, FIND_IN_SET(a.add_on_id, om.add_on_id)`;
                  db.pool.query(
                    fetchOrderMenuDataQuery,
                    [orderId],
                    (err, rawOrderMenuData) => {
                      if (err) {
                        console.error("Error fetching order menu data:", err);
                        return res
                          .status(500)
                          .json({ message: "Internal server error" });
                      }

                      // Process the raw order menu data to group add-ons
                      const orderMenuData = [];
                      const orderMenuMap = {};

                      rawOrderMenuData.forEach((row) => {
                        if (!orderMenuMap[row.row_id]) {
                          orderMenuMap[row.row_id] = {
                            row_id: row.row_id,
                            order_id: row.order_id,
                            menu_id: row.menu_id,
                            ProductName: row.ProductName,
                            price: row.price,
                            groupmid: row.groupmid,
                            notes: row.notes,
                            menuqty: row.menuqty,
                            add_on_id: row.add_on_id,
                            addonsqty: row.addonsqty,
                            varientid: row.varientid,
                            groupvarient: row.groupvarient,
                            addonsuid: row.addonsuid,
                            qroupqty: row.qroupqty,
                            isgroup: row.isgroup,
                            food_status: row.food_status,
                            allfoodready: row.allfoodready,
                            isupdate: row.isupdate,
                            variantName: row.variantName,
                            addons: [],
                          };
                          orderMenuData.push(orderMenuMap[row.row_id]);
                        }

                        // Ensure add_on_id and addonsqty are strings before splitting
                        const addOnIds = String(row.add_on_id).split(",");
                        const addonQtyArray = String(row.addonsqty).split(",");

                        addOnIds.forEach((id, index) => {
                          if (row.add_on_name && row.addons_price) {
                            orderMenuMap[row.row_id].addons.push({
                              add_on_id: id,
                              name: row.add_on_name,
                              price: row.addons_price,
                              quantity: addonQtyArray[index],
                            });
                          }
                        });
                      });

                      // Fetch the inserted bill data
                      const fetchBillDataQuery =
                        "SELECT b.*, sm.shipping_method AS shipping_method_name FROM bill b LEFT JOIN shipping_method sm ON b.shipping_type = sm.ship_id WHERE b.order_id = ?";
                      db.pool.query(
                        fetchBillDataQuery,
                        [orderId],
                        (err, billData) => {
                          if (err) {
                            console.error("Error fetching bill data:", err);
                            return res
                              .status(500)
                              .json({ message: "Internal server error" });
                          }

                          res.status(201).json({
                            message: "Order placed successfully",
                            orderId,
                            invoiceId,
                            customerOrderData: customerOrderData[0],
                            orderMenuData,
                            billData: billData[0],
                          });
                        }
                      );
                    }
                  );
                }
              );
            });
          });
        });
      }
    );
  });
};

const getTodayOrders = async (req, res) => {
  const { searchItem } = req.query;

  try {
    let getTodayOrdersQuery = `
          SELECT
              co.*,
              c.customer_name,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              rt.tablename,
              b.discount,
              b.service_charge,
              b.shipping_type,
              b.VAT,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
              sm.shipping_method AS shipping_method_name,
              co.shipping_date
          FROM
              customer_order co
          LEFT JOIN
              customer_info c ON co.customer_id = c.customer_id
          LEFT JOIN
              user w ON co.waiter_id = w.id
          LEFT JOIN
              rest_table rt ON co.table_no = rt.tableid
          LEFT JOIN
              bill b ON co.order_id = b.order_id
          LEFT JOIN
              shipping_method sm ON b.shipping_type = sm.ship_id
          WHERE
              co.orderacceptreject = 1
              AND co.order_date = CURDATE()
              AND co.order_status = 4
              AND b.bill_status = 1
      `;

    const params = [];

    if (searchItem) {
      const searchQuery = `%${searchItem}%`;

      // Handle partial matches for 'paid' and 'due'
      if (searchItem.toLowerCase().startsWith("p")) {
        getTodayOrdersQuery += ` AND (b.bill_status = 1 OR co.saleinvoice LIKE ? OR c.customer_name LIKE ? OR w.firstname LIKE ? OR w.lastname LIKE ? OR sm.shipping_method LIKE ? OR rt.tablename LIKE ? OR b.bill_amount LIKE ? OR DATE(co.shipping_date) LIKE ? OR DATE(co.order_date) LIKE ?)`;
        params.push(
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery
        );
      } else if (searchItem.toLowerCase().startsWith("d")) {
        getTodayOrdersQuery += ` AND (b.bill_status = 0 OR co.saleinvoice LIKE ? OR c.customer_name LIKE ? OR w.firstname LIKE ? OR w.lastname LIKE ? OR sm.shipping_method LIKE ? OR rt.tablename LIKE ? OR b.bill_amount LIKE ? OR DATE(co.shipping_date) LIKE ? OR DATE(co.order_date) LIKE ?)`;
        params.push(
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery
        );
      } else if (searchItem.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Match date format YYYY-MM-DD
        getTodayOrdersQuery += ` AND DATE(co.order_date) = ?`;
        params.push(searchItem);
      } else {
        getTodayOrdersQuery += `
                  AND (
                      co.saleinvoice LIKE ?
                      OR c.customer_name LIKE ?
                      OR w.firstname LIKE ?
                      OR w.lastname LIKE ?
                      OR CONCAT(w.firstname, ' ', w.lastname) LIKE ? 
                      OR sm.shipping_method LIKE ?
                      OR rt.tablename LIKE ?
                      OR b.bill_amount LIKE ?
                      OR DATE(co.shipping_date) LIKE ?
                      OR DATE(co.order_date) LIKE ?
                  )
              `;
        params.push(
          searchQuery,
          searchQuery, // co.saleinvoice
          searchQuery, // c.customer_name
          searchQuery, // w.firstname
          searchQuery, // w.lastname
          searchQuery, // sm.shipping_method
          searchQuery, // rt.tablename
          searchQuery, // b.bill_amount
          searchQuery, // co.shipping_date
          searchQuery // co.order_date
        );
      }
    }

    // Order by order_id DESC
    getTodayOrdersQuery += ` ORDER BY co.order_id DESC`;

    // console.log("Final Query:", getTodayOrdersQuery, "Params:", params);

    db.pool.query(getTodayOrdersQuery, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "Today's Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// get waiter

const getWaiter = async (req, res) => {
  try {
    // Query to get role_id where role_name matches "Waiter" (case-insensitive)
    const fkRoleIdQuery = `
      SELECT role_id 
      FROM sec_role_tbl 
      WHERE LOWER(role_name) = 'waiter'
    `;

    db.pool.query(fkRoleIdQuery, (err, roleData) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Error fetching role ID" });
      }

      if (roleData.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Waiter role not found" });
      }

      const fkRoleId = roleData[0].role_id;

      // Query to fetch waiter users based on role_id
      const getWaiterQuery = `
        SELECT 
          au.fk_role_id, 
          u.* 
        FROM 
          sec_user_access_tbl au
        LEFT JOIN 
          user u 
        ON 
          au.fk_user_id = u.id
        WHERE 
          au.fk_role_id = ?
      `;

      db.pool.query(getWaiterQuery, [fkRoleId], (err, data) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: "Error fetching waiter data" });
        }

        res.status(200).json(data);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

//   get QR order

const getQROrders = async (req, res) => {
  const { searchItem } = req.query;

  try {
    let getQROrdersQuery = `
          SELECT
              co.*,
              c.customer_name,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              rt.tablename,
              b.discount,
              b.service_charge,
              b.shipping_type AS shipping_type_id,
              b.VAT,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
              sm.shipping_method AS shipping_method_name
          FROM
              customer_order co
          LEFT JOIN
              customer_info c ON co.customer_id = c.customer_id
          LEFT JOIN
              user w ON co.waiter_id = w.id
          LEFT JOIN
              rest_table rt ON co.table_no = rt.tableid
          LEFT JOIN
              bill b ON co.order_id = b.order_id
          LEFT JOIN
              shipping_method sm ON b.shipping_type = sm.ship_id
          WHERE
              co.cutomertype = 99
      `;

    const params = [];

    // Apply searchItem filtering if provided
    if (searchItem) {
      const searchQuery = `%${searchItem}%`;

      getQROrdersQuery += `
              AND (
                  co.saleinvoice LIKE ?
                  OR c.customer_name LIKE ?
                  OR w.firstname LIKE ?
                  OR w.lastname LIKE ?
                
                  OR CONCAT(w.firstname, ' ', w.lastname) LIKE ? 
                  OR sm.shipping_method LIKE ?
                  OR co.shipping_date LIKE ?
                  OR rt.tablename LIKE ?
                  OR co.order_date LIKE ?
                  OR b.bill_amount LIKE ?
                  OR (
                      (b.bill_status = 1 AND 'paid' LIKE ?)
                      OR (b.bill_status = 0 AND 'due' LIKE ?)
                  )
              )
          `;
      params.push(
        searchQuery,
        searchQuery, // co.saleinvoice
        searchQuery, // c.customer_name
        searchQuery, // w.firstname
        searchQuery, // w.lastname
        searchQuery, // sm.shipping_method
        searchQuery, // co.shipping_date
        searchQuery, // rt.tablename
        searchQuery, // co.order_date
        searchQuery, // b.bill_amount
        searchQuery, // partial "paid" match
        searchQuery // partial "due" match
      );
    }

    // Order by order_id DESC
    getQROrdersQuery += ` ORDER BY co.order_id DESC`;

    // console.log("Final Query:", getQROrdersQuery, "Params:", params);

    db.pool.query(getQROrdersQuery, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "QR Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// allOrderList
const allOrderList = async (req, res) => {
  try {
    const getAllOrderList = `
     SELECT
      co.*,
      c.customer_name,
      w.firstname AS waiter_first_name,
      w.lastname AS waiter_last_name,
       rt.tablename,
      b.discount,
      b.service_charge,
      b.shipping_type,
      b.VAT,
      b.bill_amount,
      b.bill_date,
      b.bill_status,
      b.payment_method_id,
      sm.shipping_method AS shipping_method_name
      FROM
      customer_order co
       LEFT JOIN
      customer_info c ON co.customer_id = c.customer_id
       LEFT JOIN
      user w ON co.waiter_id = w.id
        LEFT JOIN
        rest_table rt ON co.table_no = rt.tableid
       LEFT JOIN
      bill b ON co.order_id = b.order_id
      LEFT JOIN
      shipping_method sm ON b.shipping_type = sm.ship_id
      ORDER BY
      co.order_id DESC;

    `;

    db.pool.query(getAllOrderList, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "All Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};
// getOrderById
const getOrderById = async (req, res) => {
  const order_id = req.params.order_id;

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Query to fetch order details, customer info, waiter info, and bill details
    const getOrderDetailsQuery = `
          SELECT
              co.*,
              c.customer_name,
              c.customer_email,
              c.customer_address,
              c.customer_phone,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              b.discount,
              b.service_charge,
              b.shipping_type,
              b.VAT,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
              sm.shipping_method AS shipping_method_name,
              CASE co.order_status
                                 WHEN 1 THEN 'Pending'
                                 WHEN 2 THEN 'Processing'
                                 WHEN 3 THEN 'Ready'
                                 WHEN 4 THEN 'Served'
                                 WHEN 5 THEN 'Cancel'
                                 WHEN 6 THEN 'Hold'
                               END as order_status_name
          FROM
              customer_order co
              LEFT JOIN customer_info c ON co.customer_id = c.customer_id
              LEFT JOIN user w ON co.waiter_id = w.id
              LEFT JOIN bill b ON co.order_id = b.order_id
              LEFT JOIN
              shipping_method sm ON b.shipping_type = sm.ship_id
          WHERE
              co.order_id = ?;
      `;

    // Query to fetch menu items associated with the order
    const getOrderMenuQuery = `
          SELECT
              om.*,
              f.*,
              v.variantName,
              GROUP_CONCAT(a.add_on_id) AS add_on_ids,
              GROUP_CONCAT(a.add_on_name) AS add_on_names,
              GROUP_CONCAT(a.price) AS add_on_prices
          FROM
              order_menu om
              LEFT JOIN add_ons a ON FIND_IN_SET(a.add_on_id, om.add_on_id)
              LEFT JOIN item_foods f ON om.menu_id = f.ProductsID
              LEFT JOIN variant v ON om.varientid = v.variantid
          WHERE
              om.order_id = ?
          GROUP BY om.menu_id, om.varientid;  -- Modified GROUP BY clause
      `;

    db.pool.query(getOrderDetailsQuery, [order_id], (err, orderResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching order details",
        });
      }

      db.pool.query(getOrderMenuQuery, [order_id], (err, menuResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while fetching menu items",
          });
        }

        // Process menuResult to structure add-on data
        const structuredMenuItems = menuResult.map((item) => {
          const addOnIds = item.add_on_ids ? item.add_on_ids.split(",") : [];
          const addOnNames = item.add_on_names
            ? item.add_on_names.split(",")
            : [];
          const addOnPrices = item.add_on_prices
            ? item.add_on_prices.split(",")
            : [];
          const addOnQuantities = item.addonsqty
            ? item.addonsqty.split(",")
            : [];

          const addOns = addOnIds.map((id, index) => ({
            add_on_id: id,
            add_on_name: addOnNames[index] || null,
            add_on_price: addOnPrices[index] || null,
            add_on_quantity: addOnQuantities[index] || null,
          }));

          return {
            ...item,
            add_ons: addOns,
          };
        });

        res.status(200).json({
          orderDetails: orderResult,
          menuItems: structuredMenuItems,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getOngoingOrder = async (req, res) => {
  try {
    const getOnGoingOrdersQuery = `
      SELECT
        co.*,
        c.customer_name,
        w.firstname AS waiter_first_name,
        w.lastname AS waiter_last_name,
        rt.tablename,
         b.discount,
          b.service_charge,
          b.shipping_type,
          b.VAT,
          b.bill_amount,
          b.bill_date,
          b.bill_status,
          b.payment_method_id,
          sm.shipping_method AS shipping_method_name
      FROM
        customer_order co
       LEFT JOIN
        customer_info c ON co.customer_id = c.customer_id
       LEFT JOIN
        user w ON co.waiter_id = w.id
         LEFT JOIN
        rest_table rt ON co.table_no = rt.tableid
         LEFT JOIN
      bill b ON co.order_id = b.order_id
      LEFT JOIN
      shipping_method sm ON b.shipping_type = sm.ship_id
      WHERE
      co.orderacceptreject = 1
      AND co.order_status = 2
        AND  b.bill_status = 0
      ORDER BY
        co.order_id DESC;
    `;
    // co.customerpaid = co.totalamount inclue into query when needed
    db.pool.query(getOnGoingOrdersQuery, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "Ongoing Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const cancelorder = (req, res) => {
  const { order_id } = req.params;
  const { anyreason } = req.body;

  // Validate input
  if (!order_id || !anyreason) {
    return res.status(400).json({
      success: false,
      message: "Missing order_id or cancellation reason",
    });
  }

  // Step 1: Get table_no based on order_id
  const getTableQuery = `SELECT table_no FROM customer_order WHERE order_id = ?`;
  db.pool.query(getTableQuery, [order_id], (err, result) => {
    if (err) {
      console.error("Error fetching table_no:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the table number",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No order found with the provided order_id",
      });
    }

    const tableid = result[0].table_no;

    // Step 2: Update table status
    const updateTableQuery = `UPDATE rest_table SET status = 0 WHERE tableid = ?`;
    db.pool.query(updateTableQuery, [tableid], (err) => {
      if (err) {
        console.error("Error updating table status:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the table status",
        });
      }

      // Step 3: Update order status and cancellation reason
      const updateOrderQuery = `
        UPDATE customer_order 
        SET order_status = 5, anyreason = ?
        WHERE order_id = ?`;

      db.pool.query(updateOrderQuery, [anyreason, order_id], (err, result) => {
        if (err) {
          console.error("Error updating customer_order:", err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while updating the order",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "No order found with the provided order_id",
          });
        }

        // Success response
        res.status(200).json({
          success: true,
          message: "Order canceled successfully",
        });
      });
    });
  });
};

const cancelOrdersList = async (req, res) => {
  const { searchItem } = req.query;

  try {
    let cancelOrdersQuery = `
            SELECT
                co.*,
                c.customer_name,
                w.firstname AS waiter_first_name,
                w.lastname AS waiter_last_name,
                ct.customer_type AS customer_type_name,
                rt.tablename,
                b.discount,
                b.service_charge,
                b.shipping_type,
                b.VAT,
                b.bill_amount,
                b.bill_date,
                b.bill_status,
                b.payment_method_id,
                sm.shipping_method AS shipping_method_name
            FROM
                customer_order co
            LEFT JOIN
                customer_info c ON co.customer_id = c.customer_id
            LEFT JOIN
                customer_type ct ON co.cutomertype = ct.customer_type_id
            LEFT JOIN
                user w ON co.waiter_id = w.id
            LEFT JOIN
                rest_table rt ON co.table_no = rt.tableid
            LEFT JOIN
                bill b ON co.order_id = b.order_id
            LEFT JOIN
                shipping_method sm ON b.shipping_type = sm.ship_id
            WHERE
                co.order_status = 5
        `;

    const params = [];

    // Apply searchItem filtering if provided
    if (searchItem) {
      const searchQuery = `%${searchItem}%`;

      cancelOrdersQuery += `
                AND (
                    co.order_id LIKE ?
                    OR c.customer_name LIKE ?
                    OR w.firstname LIKE ?
                    OR w.lastname LIKE ?
                    OR ct.customer_type LIKE ?
                    OR rt.tablename LIKE ?
                    OR b.bill_amount LIKE ?
                    OR b.bill_date LIKE ?
                    OR co.order_date LIKE ?
                )
            `;

      params.push(
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery
      );
    }

    // Order by order_id DESC
    cancelOrdersQuery += ` ORDER BY co.order_id DESC`;

    db.pool.query(cancelOrdersQuery, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "Canceled Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};
// complete order list

// complete order

const completeOrders = async (req, res) => {
  const { SearchItem } = req.query;

  try {
    let getCompleteOrders = `
      SELECT
        co.*,
        c.customer_name,
        w.firstname AS waiter_first_name,
        w.lastname AS waiter_last_name,
        rt.tablename,
        b.discount,
        b.service_charge,
        b.shipping_type,
        b.VAT,
        b.bill_amount,
        b.bill_date,
        b.bill_status,
        b.payment_method_id,
        sm.shipping_method AS shipping_method_name,
        ct.customer_type AS customer_type_name
      FROM
        customer_order co
      LEFT JOIN
        customer_info c ON co.customer_id = c.customer_id
      LEFT JOIN
        user w ON co.waiter_id = w.id
      LEFT JOIN
        rest_table rt ON co.table_no = rt.tableid
      LEFT JOIN
        bill b ON co.order_id = b.order_id
      LEFT JOIN
        shipping_method sm ON b.shipping_type = sm.ship_id
      LEFT JOIN 
        customer_type ct ON co.cutomertype = ct.customer_type_id
      WHERE
        co.order_status = 4
    `;

    let params = [];

    // If a search term is provided, add conditions for searching
    if (SearchItem) {
      getCompleteOrders += `
        AND (
          c.customer_name LIKE ?
          OR w.firstname LIKE ?
          OR w.lastname LIKE ?
          
          OR CONCAT(w.firstname, ' ', w.lastname) LIKE ? 
          OR rt.tablename LIKE ?
          OR b.bill_amount LIKE ?
          OR ct.customer_type LIKE ?
          OR co.order_id LIKE ?
          OR co.order_date LIKE ?
        )
      `;
      const searchQuery = `%${SearchItem}%`;
      params = [
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
      ];
    }

    getCompleteOrders += `
      ORDER BY
        co.order_id DESC;
    `;

    db.pool.query(getCompleteOrders, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "Complete Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

//  all order list and filter data
const OrderListBySearchFilter = async (req, res) => {
  try {
    const { from, to, searchName } = req.query;

    console.log("Date filter:", from, to, "Search Item:", searchName);

    let getAllOrderList = `
      SELECT
          co.*,
          c.customer_name,
          w.firstname AS waiter_first_name,
          w.lastname AS waiter_last_name,
          rt.tablename,
          b.discount,
          b.service_charge,
          b.shipping_type,
          b.VAT,
          b.bill_amount,
          b.bill_date,
          b.bill_status,
          b.payment_method_id,
          sm.shipping_method AS shipping_method_name
      FROM
          customer_order co
      LEFT JOIN
          customer_info c ON co.customer_id = c.customer_id
      LEFT JOIN
          user w ON co.waiter_id = w.id
      LEFT JOIN
          rest_table rt ON co.table_no = rt.tableid
      LEFT JOIN
          bill b ON co.order_id = b.order_id
      LEFT JOIN
          shipping_method sm ON b.shipping_type = sm.ship_id
    `;

    const params = [];
    let whereAdded = false; // Flag to track if WHERE clause is added

    // Condition 1: If there is nothing in searchName and not in from and to, then show all data
    if (!from && !to && !searchName) {
      getAllOrderList += " ORDER BY co.order_id DESC";
    } else {
      // Condition 2: If there is a date in from and to, then filter according to date
      if (from && to) {
        getAllOrderList += " WHERE co.order_date BETWEEN ? AND ?";
        params.push(from, to);
        whereAdded = true;
      }

      // Condition 3: If there is a searchName, then filter according to searchName
      if (searchName) {
        if (whereAdded) {
          getAllOrderList += " AND (";
        } else {
          getAllOrderList += " WHERE (";
        }

        const searchQuery = `%${searchName}%`;

        // Add the search conditions
        getAllOrderList += `
          c.customer_name LIKE ? 
          OR CONCAT(w.firstname, ' ', w.lastname) LIKE ? 
          OR rt.tablename LIKE ? 
          OR b.bill_amount LIKE ?
          OR co.saleinvoice LIKE ?
          OR co.order_date LIKE ?
          OR co.shipping_date LIKE ?
          OR (b.bill_status = 1 AND 'paid' LIKE ?)
          OR (b.bill_status = 0 AND 'due' LIKE ?)
        )`;

        params.push(
          searchQuery, // customer_name
          searchQuery, // waiter_first_name + waiter_last_name
          searchQuery, // tablename
          searchQuery, // bill_amount
          searchQuery, // saleinvoice
          searchQuery, // order_date
          searchQuery, // shipping_date
          searchQuery, // partial "paid" match
          searchQuery // partial "due" match
        );
      }

      // Order by clause
      getAllOrderList += " ORDER BY co.order_id DESC";
    }

    // console.log("Final Query:", getAllOrderList, "Params:", params);

    db.pool.query(getAllOrderList, params, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "All Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};
//pending order
const pendingOrders = async (req, res) => {
  const { searchItem } = req.query;

  try {
    let getPendingOrders = `
          SELECT
              co.*,
              c.customer_name,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              rt.tablename,
              b.discount,
              b.service_charge,
              b.shipping_type,
              b.VAT,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
              sm.shipping_method AS shipping_method_name,
              ct.customer_type AS customer_type_name
          FROM
              customer_order co
          LEFT JOIN
              customer_info c ON co.customer_id = c.customer_id
          LEFT JOIN
              user w ON co.waiter_id = w.id
          LEFT JOIN
              rest_table rt ON co.table_no = rt.tableid
          LEFT JOIN
              bill b ON co.order_id = b.order_id
          LEFT JOIN
              shipping_method sm ON b.shipping_type = sm.ship_id
          LEFT JOIN 
              customer_type ct ON co.cutomertype = ct.customer_type_id
          WHERE
              co.order_status = 1 or co.order_status=2
      `;

    const params = [];

    // Apply searchItem filtering if provided
    if (searchItem) {
      const searchQuery = `%${searchItem}%`;

      getPendingOrders += `
              AND (
                  co.saleinvoice LIKE ?
                  OR c.customer_name LIKE ?
                  OR w.firstname LIKE ?
                  OR w.lastname LIKE ?
                  OR rt.tablename LIKE ?
                  OR co.order_date LIKE ?
                  OR b.bill_amount LIKE ?
                  OR co.shipping_date LIKE ?
                  OR (b.bill_status = 1 AND 'paid' LIKE ?) 
                  OR (b.bill_status = 0 AND 'due' LIKE ?)
              )
          `;
      params.push(
        searchQuery, // saleinvoice
        searchQuery, // customer_name
        searchQuery, // firstname
        searchQuery, // lastname
        searchQuery, // tablename
        searchQuery, // order_date
        searchQuery, // bill_amount
        searchQuery, // shipping_date
        searchQuery, // partial "paid" match
        searchQuery // partial "due" match
      );
    }

    // Order by order_id DESC
    getPendingOrders += ` ORDER BY co.order_id DESC`;

    // console.log("Final Query:", getPendingOrders, "Params:", params);

    db.pool.query(getPendingOrders, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "Pending Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};
// online order

const getOnlineOrders = async (req, res) => {
  const { searchItem } = req.query;

  try {
    let getOnlineOrdersQuery = `
          SELECT
              co.*,
              c.customer_name,
              c.customer_phone AS customer_number,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              rt.tablename,
              b.discount,
              b.service_charge,
              b.shipping_type AS shipping_type_id,
              b.VAT,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
              sm.shipping_method AS shipping_method_name
          FROM
              customer_order co
          LEFT JOIN
              customer_info c ON co.customer_id = c.customer_id
          LEFT JOIN
              user w ON co.waiter_id = w.id
          LEFT JOIN
              rest_table rt ON co.table_no = rt.tableid
          LEFT JOIN
              bill b ON co.order_id = b.order_id
          LEFT JOIN
              shipping_method sm ON b.shipping_type = sm.ship_id
          WHERE
              co.cutomertype = 2
      `;

    const params = [];

    // Apply searchItem filtering if provided
    if (searchItem) {
      const searchQuery = `%${searchItem}%`;

      // Handle partial matches for 'paid' and 'due'
      if (searchItem.toLowerCase().startsWith("p")) {
        getOnlineOrdersQuery += ` AND (b.bill_status = 1 OR c.customer_name LIKE ? OR w.firstname LIKE ? OR w.lastname LIKE ? OR sm.shipping_method LIKE ? OR co.shipping_date LIKE ? OR rt.tablename LIKE ? OR co.saleinvoice LIKE ? OR co.order_date LIKE ? OR b.bill_amount LIKE ? OR b.bill_date LIKE ?)`;
        params.push(
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery
        );
      } else if (searchItem.toLowerCase().startsWith("d")) {
        getOnlineOrdersQuery += ` AND (b.bill_status = 0 OR c.customer_name LIKE ? OR w.firstname LIKE ? OR w.lastname LIKE ? OR sm.shipping_method LIKE ? OR co.shipping_date LIKE ? OR rt.tablename LIKE ? OR co.saleinvoice LIKE ? OR co.order_date LIKE ? OR b.bill_amount LIKE ? OR b.bill_date LIKE ?)`;
        params.push(
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery
        );
      } else if (searchItem.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Match date format YYYY-MM-DD
        getOnlineOrdersQuery += ` AND DATE(co.order_date) = ?`;
        params.push(searchItem);
      } else {
        getOnlineOrdersQuery += `
                  AND (
                      co.saleinvoice LIKE ?
                      OR c.customer_name LIKE ?
                      OR w.firstname LIKE ?
                      OR w.lastname LIKE ?
                      OR  CONCAT(w.firstname, ' ', w.lastname) LIKE ? 
                      OR sm.shipping_method LIKE ?
                      OR co.shipping_date LIKE ?
                      OR rt.tablename LIKE ?
                      OR co.order_date LIKE ?
                      OR b.bill_amount LIKE ?
                      OR b.bill_date LIKE ?
                  )
              `;
        params.push(
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery,
          searchQuery
        );
      }
    }

    getOnlineOrdersQuery += ` ORDER BY co.order_id DESC`;

    // console.log("Final Query:", getOnlineOrdersQuery, "Params:", params);

    db.pool.query(getOnlineOrdersQuery, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "An error occurred" });
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "Online Orders fetched successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const getQrorderdata = async (req, res) => {
  const categoryId = req.query.categoryId;
  const searchTerm = req.query.searchTerm || "";

  let queryProducts;
  let params = [];

  if (categoryId) {
    queryProducts = `
          SELECT f.*, m.*, k.kitchen_name, p.*
          FROM item_foods f
          LEFT JOIN tbl_menutype m ON f.menutype = m.menutypeid
          LEFT JOIN tbl_kitchen k ON f.kitchenid = k.kitchenid
          LEFT JOIN printers p ON k.printer_id = p.id
          WHERE f.CategoryID = ? AND f.ProductsIsActive = 1
      `;
    params.push(categoryId);
  } else {
    queryProducts = `
          SELECT f.*, m.*, k.kitchen_name, p.*
          FROM item_foods f
          LEFT JOIN tbl_menutype m ON f.menutype = m.menutypeid
          LEFT JOIN tbl_kitchen k ON f.kitchenid = k.kitchenid
          LEFT JOIN printers p ON k.printer_id = p.id
          WHERE f.ProductsIsActive = 1
      `;
  }

  try {
    const products = await new Promise((resolve, reject) => {
      db.pool.query(queryProducts, params, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    const detailedProducts = [];

    for (const product of products) {
      let params2 = [product.ProductsID];
      let queryVariants = `
              SELECT v.*, v.variantName, v.price
              FROM variant v
              WHERE v.menuid = ?
          `;
      if (searchTerm) {
        queryVariants += ` AND (v.variantName LIKE ? OR v.price LIKE ?)`;
        params2.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      const variants = await new Promise((resolve, reject) => {
        db.pool.query(queryVariants, params2, (err, results) => {
          if (err) reject(err);
          resolve(results || []);
        });
      });

      const addons = await new Promise((resolve, reject) => {
        const queryAddons = `
                  SELECT a.*
                  FROM menu_add_on ma
                  LEFT JOIN add_ons a ON ma.add_on_id = a.add_on_id
                  WHERE ma.is_active = 1 AND ma.menu_id = ?;
              `;
        db.pool.query(queryAddons, [product.ProductsID], (err, results) => {
          if (err) reject(err);
          resolve(results || []);
        });
      });

      if (variants.length > 0) {
        variants.forEach((variant) => {
          detailedProducts.push({
            ProductName: product.ProductName,
            ProductImage: product.ProductImage,
            productvat: product.productvat,
            CategoryID: product.CategoryID,
            ProductsID: product.ProductsID,
            kitchen_name: product.kitchen_name,
            kitchenid: product.kitchenid,
            menutype: product.menutype,
            variantid: variant.variantid,
            menuid: variant.menuid,
            variantName: variant.variantName,
            price: variant.price,
            addons,
          });
        });
      } else if (searchTerm) {
        if (
          product.ProductName.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          product.ProductImage.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          detailedProducts.push({
            ProductName: product.ProductName,
            ProductImage: product.ProductImage,
            productvat: product.productvat,
            CategoryID: product.CategoryID,
            ProductsID: product.ProductsID,
            kitchen_name: product.kitchen_name,
            kitchenid: product.kitchenid,
            menutype: product.menutype,
            variants: [],
            addons,
          });
        }
      } else {
        detailedProducts.push({
          ProductName: product.ProductName,
          ProductImage: product.ProductImage,
          productvat: product.productvat,
          CategoryID: product.CategoryID,
          ProductsID: product.ProductsID,
          kitchen_name: product.kitchen_name,
          kitchenid: product.kitchenid,
          menutype: product.menutype,
          variants: [],
          addons,
        });
      }
    }

    res.status(200).json(detailedProducts);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const Placeqrorder = (req, res) => {
  const {
    order_details,
    grand_total,

    VAT,

    table_id = 7,
    customer_type = 99,

    customer_name,
    customer_note,
    customer_phone,
  } = req.body;

  const create_by = req.id || 178;

  // Validate required fields
  if (
    !order_details ||
    !Array.isArray(order_details) ||
    order_details.length === 0 ||
    !grand_total
  ) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  // Insert customer info
  const customer_query = `INSERT INTO customer_info (customer_name, customer_phone) VALUES (?, ?)`;
  db.pool.query(
    customer_query,
    [customer_name, customer_phone],
    (err, result) => {
      if (err) {
        console.error("Error inserting customer:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      const customer_id = result.insertId;
      console.log("c", customer_id);
      // const total_amount = grand_total - VAT ;
      // Insert the order
      const orderQuery = `INSERT INTO customer_order 
      (saleinvoice, cutomertype, isthirdparty, waiter_id, order_date, order_time, table_no, totalamount, order_status, orderacceptreject, splitpay_status, customer_note, customer_id)
      VALUES (?, ?, 0, 0, NOW(), CURTIME(), ?, ?, 1, 1, 0, ?, ?)`;

      const maxOrderIdQuery =
        "SELECT MAX(order_id) AS maxOrderId FROM customer_order";
      db.pool.query(maxOrderIdQuery, (err, result) => {
        if (err) {
          console.error("Error getting max order ID:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        const maxOrderId = result[0]?.maxOrderId || 0;
        const invoiceId = maxOrderId + 1;
        console.log("grand total aaya ", grand_total);
        db.pool.query(
          orderQuery,
          [
            invoiceId,
            customer_type,
            table_id,
            grand_total,
            customer_note,
            customer_id,
          ],

          (err, result) => {
            if (err) {
              console.error("Error inserting order:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            const orderId = result.insertId;

            // Insert order details
            const orderDetailsQuery = `INSERT INTO order_menu 
          (order_id, menu_id, price, menuqty, add_on_id, addonsqty, varientid, food_status, allfoodready)
          VALUES ?`;
            const orderDetailsData = order_details.map((detail) => {
              const addOnIds = Array.isArray(detail.checkedaddons)
                ? detail.checkedaddons.map((addon) => addon.add_on_id).join(",")
                : null;
              const addOnQuantities = Array.isArray(detail.checkedaddons)
                ? detail.checkedaddons
                    .map((addon) => addon.add_on_quantity)
                    .join(",")
                : null;
              // console.log("order details", detail);
              return [
                orderId,
                detail.ProductsID,
                // detail.productID,

                detail.price,
                detail.quantity,
                addOnIds,
                addOnQuantities,
                detail.variantid || null,
                0, // food_status
                0, // allfoodready
              ];
            });

            db.pool.query(orderDetailsQuery, [orderDetailsData], (err) => {
              if (err) {
                console.error("Error inserting order details:", err);
                return res
                  .status(500)
                  .json({ message: "Internal server error" });
              }

              // Update table status to booked
              const updateTableStatusQuery =
                "UPDATE rest_table SET status = 1 WHERE tableid = ?";
              db.pool.query(updateTableStatusQuery, [table_id], (err) => {
                if (err) {
                  console.error("Error updating table status:", err);
                  return res
                    .status(500)
                    .json({ message: "Internal server error" });
                }

                const total_amount = grand_total - VAT;
                const shipping_type = customer_type === 99 ? 1 : null;

                // Insert into bill table
                const invoiceQuery = `INSERT INTO bill 
              (create_by, order_id, total_amount,payment_method_id,shipping_type, VAT, bill_amount, bill_date, bill_time, create_at, bill_status, create_date)
              VALUES (?, ?,  ?, 0, ?, ?, ?, NOW(), CURTIME(), NOW(), 0,  NOW())`;

                const billData = [
                  create_by,
                  orderId,
                  total_amount,

                  shipping_type,
                  VAT,
                  grand_total,
                ];

                db.pool.query(invoiceQuery, billData, (err) => {
                  if (err) {
                    console.error("Error inserting invoice:", err);
                    return res
                      .status(500)
                      .json({ message: "Internal server error" });
                  }

                  // Insert into table details if customer_type is 99
                  if (customer_type === 99) {
                    const additionalQuery = `INSERT INTO table_details 
                  (table_id, customer_id, order_id, time_enter, created_at)
                  VALUES (?, ?, ?, CURTIME(), NOW())`;

                    db.pool.query(
                      additionalQuery,
                      [table_id, customer_id, orderId],
                      (err) => {
                        if (err) {
                          console.error("Error inserting table data:", err);
                          return res
                            .status(500)
                            .json({ message: "Internal server error" });
                        }
                      }
                    );
                  }

                  // Success response
                  res.status(201).json({
                    message: "Order placed successfully",
                    orderId,
                    invoiceId,
                  });
                });
              });
            });
          }
        );
      });
    }
  );
};

const getQrOrderById = async (req, res) => {
  const order_id = req.params.id;

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Query to fetch order details, customer info, waiter info, and bill details
    const getOrderDetailsQuery = `
          SELECT
              co.*,
              c.customer_name,
              c.customer_email,
              c.customer_address,
              c.customer_phone,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              b.discount,
              b.service_charge,
              b.shipping_type,
              b.VAT,
              b.bill_id,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
             
              CASE co.order_status
                                 WHEN 1 THEN 'Pending'
                                 WHEN 2 THEN 'Processing'
                                 WHEN 3 THEN 'Ready'
                                 WHEN 4 THEN 'Served'
                                 WHEN 5 THEN 'Cancel'
                                 WHEN 6 THEN 'Hold'

                               END as order_status_name
          FROM
              customer_order co
              LEFT JOIN customer_info c ON co.customer_id = c.customer_id
              LEFT JOIN user w ON co.waiter_id = w.id
              LEFT JOIN bill b ON co.order_id = b.order_id
            
          WHERE
              co.order_id = ?;
      `;

    // Query to fetch menu items associated with the order
    const getOrderMenuQuery = `
          SELECT
              om.*,
              f.*,
              v.variantName,
              GROUP_CONCAT(a.add_on_id) AS add_on_ids,
              GROUP_CONCAT(a.add_on_name) AS add_on_names,
              GROUP_CONCAT(a.price) AS add_on_prices
          FROM
              order_menu om
              LEFT JOIN add_ons a ON FIND_IN_SET(a.add_on_id, om.add_on_id)
              LEFT JOIN item_foods f ON om.menu_id = f.ProductsID
              LEFT JOIN variant v ON om.varientid = v.variantid
          WHERE
              om.order_id = ?
          GROUP BY om.menu_id, om.varientid;  
      `;

    db.pool.query(getOrderDetailsQuery, [order_id], (err, orderResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching order details",
        });
      }

      db.pool.query(getOrderMenuQuery, [order_id], (err, menuResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while fetching menu items",
          });
        }

        // Process menuResult to structure add-on data
        const structuredMenuItems = menuResult.map((item) => {
          const addOnIds = item.add_on_ids ? item.add_on_ids.split(",") : [];
          const addOnNames = item.add_on_names
            ? item.add_on_names.split(",")
            : [];
          const addOnPrices = item.add_on_prices
            ? item.add_on_prices.split(",")
            : [];
          const addOnQuantities = item.addonsqty
            ? item.addonsqty.split(",")
            : [];

          const addOns = addOnIds.map((id, index) => ({
            add_on_id: id,
            add_on_name: addOnNames[index] || null,
            add_on_price: addOnPrices[index] || null,
            add_on_quantity: addOnQuantities[index] || null,
          }));

          return {
            ...item,
            add_ons: addOns,
          };
        });

        res.status(200).json({
          orderDetails: orderResult,
          menuItems: structuredMenuItems,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const Updateqrorder = (req, res) => {
  const  order_id=req.params.id;
  console.log("order id",order_id)
  const {
   
    order_details,
    grand_total,
    VAT,
    table_id,
    customer_name,
    customer_phone,
    customer_note,
  } = req.body;

  const update_by = req.id || 178;

  // Validate required fields
  if (!order_id || !order_details || !Array.isArray(order_details) || order_details.length === 0 || !grand_total) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  // Update customer info
  const updateCustomerQuery = `UPDATE customer_info SET customer_name = ?, customer_phone = ? WHERE customer_id = (SELECT customer_id FROM customer_order WHERE order_id = ?)`;
  db.pool.query(updateCustomerQuery, [customer_name, customer_phone, order_id], (err) => {
    if (err) {
      console.error("Error updating customer:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Update order
    const updateOrderQuery = `UPDATE customer_order SET table_no = ?, totalamount = ?, customer_note = ? WHERE order_id = ?`;
    db.pool.query(updateOrderQuery, [table_id, grand_total, customer_note, order_id], (err) => {
      if (err) {
        console.error("Error updating order:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Delete existing order details
      const deleteOrderDetailsQuery = `DELETE FROM order_menu WHERE order_id = ?`;
      db.pool.query(deleteOrderDetailsQuery, [order_id], (err) => {
        if (err) {
          console.error("Error deleting order details:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        // Insert updated order details
        const insertOrderDetailsQuery = `INSERT INTO order_menu 
          (order_id, menu_id, price, menuqty, add_on_id, addonsqty, varientid, food_status, allfoodready)
          VALUES ?`;

        const orderDetailsData = order_details.map((detail) => {
          const addOnIds =
            Array.isArray(detail.checkedaddons)
              ? detail.checkedaddons.map((addon) => addon.add_on_id).join(",")
              : null;
          const addOnQuantities =
            Array.isArray(detail.checkedaddons)
              ? detail.checkedaddons.map((addon) => addon.add_on_quantity).join(",")
              : null;
          return [
            order_id,
            detail.ProductsID,
            detail.price,
            detail.quantity,
            addOnIds,
            addOnQuantities,
            detail.variantid || null,
            0, // food_status
            0, // allfoodready
          ];
        });

        db.pool.query(insertOrderDetailsQuery, [orderDetailsData], (err) => {
          if (err) {
            console.error("Error inserting updated order details:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          // Update table status
          const updateTableStatusQuery = `UPDATE rest_table SET status = 1 WHERE tableid = ?`;
          db.pool.query(updateTableStatusQuery, [table_id], (err) => {
            if (err) {
              console.error("Error updating table status:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            // Update bill
            const total_amount = grand_total - VAT;
            const updateBillQuery = `UPDATE bill SET 
              total_amount = ?,
              VAT = ?,
              bill_amount = ?,
              update_by = ?,
              update_date = NOW()
              WHERE order_id = ?`;

            db.pool.query(
              updateBillQuery,
              [total_amount, VAT, grand_total, update_by, order_id],
              (err) => {
                if (err) {
                  console.error("Error updating bill:", err);
                  return res.status(500).json({ message: "Internal server error" });
                }

                // Success response
                res.status(200).json({ message: "Order updated successfully", order_id });
              }
            );
          });
        });
      });
    });
  });
};

const getQrOrderDetailsById = async (req, res) => {
  const order_id = req.params.id;

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Query to fetch order details, customer info, waiter info, and bill details
    const getOrderDetailsQuery = `
          SELECT
              co.*,
              c.customer_name,
              c.customer_email,
              c.customer_address,
              c.customer_phone,
              w.firstname AS waiter_first_name,
              w.lastname AS waiter_last_name,
              b.discount,
              b.service_charge,
              b.shipping_type,
              b.VAT,
              b.bill_id,
              b.bill_amount,
              b.bill_date,
              b.bill_status,
              b.payment_method_id,
             
              CASE co.order_status
                                 WHEN 1 THEN 'Pending'
                                 WHEN 2 THEN 'Processing'
                                 WHEN 3 THEN 'Ready'
                                 WHEN 4 THEN 'Served'
                                 WHEN 5 THEN 'Cancel'
                                 WHEN 6 THEN 'Hold'

                               END as order_status_name
          FROM
              customer_order co
              LEFT JOIN customer_info c ON co.customer_id = c.customer_id
              LEFT JOIN user w ON co.waiter_id = w.id
              LEFT JOIN bill b ON co.order_id = b.order_id
            
          WHERE
              co.order_id = ?;
      `;

    // Query to fetch menu items associated with the order
    const getOrderMenuQuery = `
          SELECT
              om.*,
              om.menuqty AS quantity,
              f.*,
              v.variantName,
              om.varientid AS variantid,
              GROUP_CONCAT(a.add_on_id) AS add_on_ids,
              GROUP_CONCAT(a.add_on_name) AS add_on_names,
              GROUP_CONCAT(a.price) AS add_on_prices
          FROM
              order_menu om
              LEFT JOIN add_ons a ON FIND_IN_SET(a.add_on_id, om.add_on_id)
              LEFT JOIN item_foods f ON om.menu_id = f.ProductsID
              LEFT JOIN variant v ON om.varientid = v.variantid
          WHERE
              om.order_id = ?
          GROUP BY om.menu_id, om.varientid;  
      `;

    db.pool.query(getOrderDetailsQuery, [order_id], (err, orderResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching order details",
        });
      }

      db.pool.query(getOrderMenuQuery, [order_id], (err, menuResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while fetching menu items",
          });
        }

        // Process menuResult to structure add-on data
        const structuredMenuItems = menuResult.map((item) => {
          const addOnIds = item.add_on_ids ? item.add_on_ids.split(",") : [];
          const addOnNames = item.add_on_names
            ? item.add_on_names.split(",")
            : [];
          const addOnPrices = item.add_on_prices
            ? item.add_on_prices.split(",")
            : [];
          const addOnQuantities = item.addonsqty
            ? item.addonsqty.split(",")
            : [];

          const addOns = addOnIds.map((id, index) => ({
            add_on_id: id,
            add_on_name: addOnNames[index] || null,
            add_on_price: addOnPrices[index] || null,
            add_on_quantity: addOnQuantities[index] || null,
          }));

          return {
            ...item,
            add_ons: addOns,
          };
        });

        res.status(200).json({
          orderDetails: orderResult,
          menuItems: structuredMenuItems,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  getCategoryList,
  getProductsByCategory,
  orderPlace,
  getTodayOrders,
  getWaiter,
  getQROrders,
  allOrderList,
  getOrderById,
  getOngoingOrder,
  cancelorder,
  cancelOrdersList,
  completeOrders,
  OrderListBySearchFilter,
  pendingOrders,
  getOnlineOrders,
  getQrorderdata,
  Placeqrorder,
  getQrOrderById,
  Updateqrorder,
  getQrOrderDetailsById,
};
