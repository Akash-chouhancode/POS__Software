const db=require('../utils/db')


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
const draftOrderPlace = (req, res) => {
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
    const create_by=req.id;
  
   
  
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
                            VALUES (?, ?, ?, ?, ?, NOW(), CURTIME(), ?, ?, 6, 1, 0)`;
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
                  db.pool.query(additionalQuery, additionalData, (err, result) => {
                    if (err) {
                      console.error("Error inserting table data:", err);
                      return res
                        .status(500)
                        .json({ message: "Internal server error" });
                    }
                  });
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

  const updateOrder = async (req, res) => {
    const order_id = req.params.id;
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
  
    if (
      !order_id ||
      !customer_id ||
      !order_details ||
      !Array.isArray(order_details) ||
      !grand_total
    ) {
      return res.status(400).json({ message: "Invalid request data" });
    }
  
    const waiterId = waiter_id || 0;
    const tableId = table_id || 0;
    const isthirdparty = customer_type === 3 ? 3 : 0;
  
    try {
      // Update customer_order table
      const updateOrderQuery = `
        UPDATE customer_order 
        SET customer_id = ?, cutomertype = ?, isthirdparty = ?, waiter_id = ?, order_date = NOW(), order_time = CURTIME(), table_no = ?, totalamount = ?, order_status=2, orderacceptreject=1, splitpay_status=0
        WHERE order_id = ?`;
      await dbQuery(updateOrderQuery, [
        customer_id,
        customer_type,
        isthirdparty,
        waiterId,
        tableId,
        grand_total,
        order_id,
      ]);
  
      // Delete existing order_menu entries for this order_id
      const deleteOrderDetailsQuery = "DELETE FROM order_menu WHERE order_id = ?";
      await dbQuery(deleteOrderDetailsQuery, [order_id]);
  
      // Insert new order details
      const orderDetailsQuery = `
        INSERT INTO order_menu(order_id, menu_id, price, menuqty, add_on_id, addonsqty, varientid, food_status, allfoodready) 
        VALUES ?`;
  
      const orderDetailsData = order_details.map((detail) => {
        const addOnIds = detail.addons.map((addon) => addon.add_on_id).join(",");
        const addOnQuantities = detail.addons
          .map((addon) => addon.add_on_quantity)
          .join(",");
        return [
          order_id,
          detail.ProductsID,
          detail.price,
          detail.quantity,
          addOnIds,
          addOnQuantities,
          detail.variantid,
          0,
          0,
        ];
      });
      await dbQuery(orderDetailsQuery, [orderDetailsData]);
  
      // Update table status if necessary
      const updateTableStatusQuery =
        "UPDATE rest_table SET status = 1 WHERE tableid = ?";
      await dbQuery(updateTableStatusQuery, [table_id]);
  
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
  
      // Update bill table
      const updateBillQuery = `
        UPDATE bill 
        SET customer_id = ?, total_amount = ?, discount = ?, service_charge = ?, shipping_type = ?, VAT = ?, bill_amount = ?, bill_date = NOW(), bill_time = CURTIME(), create_at = NOW(),bill_status=0,payment_method_id=0,create_date = NOW()
        WHERE order_id = ?`;
      const billData = [
        customer_id,
        total_amount,
        discount,
        service_charge || 0.0,
        shipping_type,
        VAT || 0.0,
        grand_total,
        order_id,
      ];
      await dbQuery(updateBillQuery, billData);
      console.log("hiiii",customer_type)
  
      if (customer_type === 1 || customer_type === 99) {
        console.log("customer",customer_type)
        // Insert into table_details
        const additionalQuery =
          "INSERT INTO table_details(table_id, customer_id, order_id, time_enter, created_at) VALUES (?, ?, ?, CURTIME(), NOW())";
        await dbQuery(additionalQuery, [table_id, customer_id, order_id]);
      }
  
      // Fetch customer order data
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
                  WHEN 6 THEN 'Hold'
                END as order_status_name
        FROM customer_order co
        LEFT JOIN customer_info c ON co.customer_id = c.customer_id
        LEFT JOIN customer_type ct ON co.cutomertype = ct.customer_type_id
        LEFT JOIN user w ON co.waiter_id = w.id
        WHERE co.order_id = ?`;
      const customerOrderData = await dbQuery(fetchCustomerOrderDataQuery, [order_id]);
  
      // Fetch order_menu data
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
      const rawOrderMenuData = await dbQuery(fetchOrderMenuDataQuery, [order_id]);
  
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
      const fetchBillDataQuery =
      "SELECT b.*, sm.shipping_method AS shipping_method_name FROM bill b LEFT JOIN shipping_method sm ON b.shipping_type = sm.ship_id WHERE b.order_id = ?";
    
      const shipData= await dbQuery(fetchBillDataQuery,[order_id])
      
  
  
      res.status(201).json({
        message: "Updated order successfully",
        data: {
          order_id:order_id,
          order: customerOrderData[0],
          invoiceId:customerOrderData[0].saleinvoice,
          orderdetails: orderMenuData,
          shipData:shipData[0]
        },
      });
    } catch (error) {
      console.error("Error in updateOrder function:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

  const draftgetOrderById = async (req, res) => {
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
                                   WHEN 6 THEN  'Hold'

                                   
                                 END as order_status_name
            FROM
                customer_order co
                LEFT JOIN customer_info c ON co.customer_id = c.customer_id
                LEFT JOIN user w ON co.waiter_id = w.id
                LEFT JOIN bill b ON co.order_id = b.order_id
                LEFT JOIN
                shipping_method sm ON b.shipping_type = sm.ship_id
            WHERE
                co.order_id = ? AND co.order_status=6;
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
  
  const draftgetOrders = async (req, res) => {
    try {
      // Corrected SQL query
      const sql = `
        SELECT o.*, o.order_id, ci.customer_name, ctype.customer_type
        FROM customer_order o
        LEFT JOIN customer_info ci ON ci.customer_id = o.customer_id 
        LEFT JOIN customer_type ctype ON ctype.customer_type_id = o.cutomertype 
        WHERE o.order_status = 6
      `;
  
      // Execute the query (assuming dbQuery is a function returning a promise)
      const result = await dbQuery(sql);
  
      // Check if data exists
      // if (result.length === 0) {
      //   return res.status(200).json({ message: "No orders found with draft status." });
      // }
  
      // Send the fetched data as a response
      res.status(200).json({ data: result });
    } catch (error) {
      // Handle any errors
      console.error("Error fetching draft orders:", error.message);
      res.status(500).json({ message: "Internal Server Error", success: false });
    }
  };


  module.exports = {
    draftOrderPlace,
    updateOrder,
    draftgetOrderById,
    draftgetOrders
  };
  