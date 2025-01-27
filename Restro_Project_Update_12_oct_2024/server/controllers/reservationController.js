const db = require("../utils/db");

// Create a new reservation of the day

const createUnavailability = (req, res) => {
  const { offdaydate, start_time, end_time, is_active } = req.body;

  // Concatenate start_time and end_time into a single string for availtime
  const availtime = `${start_time} - ${end_time}`;

  const sql = `INSERT INTO reservationofday (offdaydate, availtime, is_active) VALUES (?, ?, ?)`;
  const values = [offdaydate, availtime, is_active];

  db.pool.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).send("Successfully created");
  });
};

// Get all reservations of the day
const getUnavailability = (req, res) => {
  try {
    const { searchItem } = req.query;
    console.log(searchItem);

    let getReservationsQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
      // Fetch all reservations if searchItem is not provided or is an empty string
      getReservationsQuery = `SELECT * FROM reservationofday ORDER BY offdayid DESC`;
    } else {
      // Fetch reservations based on search criteria
      getReservationsQuery = `SELECT * FROM reservationofday WHERE offdaydate LIKE ? OR availtime LIKE ? ORDER BY offdayid DESC`;
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery, searchQuery];
    }

    // Execute the query
    db.pool.query(getReservationsQuery, queryParams, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching reservations",
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        message: "Unavilable data fetched successfully",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// Update a reservation of the day
const updateUnavailability = (req, res) => {
  const { id } = req.params;
  const { offdaydate, availtime, is_active } = req.body;

  // Fetch current data
  const fetchCurrentDataSql =
    "SELECT * FROM reservationofday WHERE offdayid = ?";
  db.pool.query(fetchCurrentDataSql, [id], (fetchErr, fetchData) => {
    if (fetchErr) {
      console.error("Database fetch error:", fetchErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (fetchData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation record not found" });
    }

    const currentData = fetchData[0];
    const updatedData = {
      offdaydate:
        offdaydate !== undefined ? offdaydate : currentData.offdaydate,
      availtime: availtime !== undefined ? availtime : currentData.availtime,
      is_active:
        is_active !== undefined ? (is_active ? 1 : 0) : currentData.is_active,
    };

    // Update the reservation data
    const updateSql =
      "UPDATE reservationofday SET offdaydate = ?, availtime = ?, is_active = ? WHERE offdayid = ?";
    db.pool.query(
      updateSql,
      [
        updatedData.offdaydate,
        updatedData.availtime,
        updatedData.is_active,
        id,
      ],
      (updateErr, result) => {
        if (updateErr) {
          console.error("Database update error:", updateErr);
          return res
            .status(500)
            .json({
              success: false,
              message: "An error occurred while updating the reservation",
            });
        } else if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Reservation record not found" });
        } else {
          return res
            .status(200)
            .json({
              success: true,
              message: "Reservation updated successfully",
            });
        }
      }
    );
  });
};
// Get Reservation by id

const getUnavailabilitybyid = (req, res) => {
  const { id } = req.params; // Destructure 'id' from req.params
  console.log(id);
  try {
    // SQL query to get reservations by ID
    const getReservationsQuery = `SELECT * FROM reservationofday WHERE offdayid = ?`;

    // Execute the query with the 'id' parameter
    db.pool.query(getReservationsQuery, [id], (err, result) => {
      if (err) {
        console.error("Error fetching reservations:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching reservations",
        });
      }

      // Check if results exist
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          data: result,
          message: "Reservations fetched successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `No reservations found for id ${id}`,
        });
      }
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

const createReservation = (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_mobile,
    tablename,
    person_capacity,
    formtime,
    totime,
    reserveday,
  } = req.body;
  console.log(req.body);
  // Insert into customer_info
  const customerInfoSql = `INSERT INTO customer_info (customer_name, customer_email, customer_phone) VALUES (?, ?, ?)`;
  const customerInfoValues = [customer_name, customer_email, customer_mobile];

  db.pool.query(customerInfoSql, customerInfoValues, (err, customerResult) => {
    if (err) {
      console.error("Error inserting into customer_info:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to create customer",
          error: err,
        });
    }

    const customer_id = customerResult.insertId;

    // Retrieve the table ID from rest_table using tablename
    const tblSql = `SELECT * FROM rest_table WHERE tablename = ?`;
    db.pool.query(tblSql, [tablename], (err, tableResult) => {
      if (err) {
        console.error("Error retrieving table information:", err);
        return res
          .status(500)
          .json({
            success: false,
            message: "Failed to find table",
            error: err,
          });
      }

      // Check if a table was found
      if (tableResult.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Table not found" });
      }

      const tableid = tableResult[0].tableid; // Corrected to fetch tableid

      // Insert into tbl_reservation
      const reservationSql = `INSERT INTO tblreservation (cid, tableid, person_capicity, formtime, totime, reserveday, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const reservationValues = [
        customer_id,
        tableid,
        person_capacity,
        formtime,
        totime,
        reserveday,
        1,
      ];

      db.pool.query(reservationSql, reservationValues, (err, reservationResult) => {
        if (err) {
          console.error("Error inserting into tbl_reservation:", err);
          return res
            .status(500)
            .json({
              success: false,
              message: "Failed to create reservation",
              error: err,
            });
        }

        res
          .status(201)
          .json({ success: true, message: "Reservation created successfully" });
      });
    });
  });
};

// Delete a reservation of the day
const deleteUnavailability = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM reservationofday WHERE offdayid = ?`;

  db.pool.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send("Successfully deleted");
  });
};
// get all Free table
// const getavailablereservationtables = async (req, res) => {
//   const { reserveday, formtime, totime } = req.query;
//   console.log(reserveday, formtime, totime);

//   try {
//     // Format the date to 'YYYY-MM-DD' for SQL compatibility
//     const formattedDate = new Date(reserveday).toISOString().split("T")[0];

//     // SQL query to find reserved tables
//     const sql = `
//     SELECT r.tableid
//     FROM tblreservation AS r
//     WHERE r.reserveday = ?
//       AND r.formtime <= ?
//       AND r.totime >= ?
//       AND r.status = 1
//   `;

//     // Execute the query with parameters
//     db.pool.query(sql, [formattedDate, formtime, totime], (err, reservedResults) => {
//       if (err) {
//         console.error("Database query error:", err);
//         return res.status(500).json({ error: "Database query failed" });
//       }

//       if (reservedResults.length > 0) {
//         // Collect the reserved table IDs
//         const reservedTableIds = reservedResults.map((row) => row.tableid);

//         // SQL query to find available tables in rest_table that are not reserved
//         const availableTableQuery = `
//           SELECT *
//           FROM rest_table
//           WHERE tableid NOT IN (?)
//         `;

//         db.pool.query(
//           availableTableQuery,
//           [reservedTableIds],
//           (err, availableResults) => {
//             if (err) {
//               console.error("Database query error:", err);
//               return res.status(500).json({ error: "Database query failed" });
//             }

//             // Check if there are available tables
//             if (availableResults.length > 0) {
//               return res.status(200).json({ data: availableResults });
//             } else {
//               return res
//                 .status(404)
//                 .json({
//                   message: "No tables available for the given criteria",
//                 });
//             }
//           }
//         );
//       } else {
//         // If no reservations found, return all tables as available
//         const allTableQuery = `
//           SELECT *
//           FROM rest_table WHERE status=0
//         `;

//         db.pool.query(allTableQuery, (err, allTables) => {
//           if (err) {
//             console.error("Database query error:", err);
//             return res.status(500).json({ error: "Database query failed" });
//           }

//           return res.status(200).json({ data: allTables });
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Error in getavailablereservationtables:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
const getavailablereservationtables = async (req, res) => {
  const { reserveday, formtime, totime } = req.query;

  if (!reserveday || !formtime || !totime) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    // Validate and format the date to 'YYYY-MM-DD'
    const formattedDate = new Date(reserveday);
    if (isNaN(formattedDate)) {
      return res.status(400).json({ error: "Invalid reservation date" });
    }
    const formattedDateStr = formattedDate.toISOString().split("T")[0];

    // Query to find reserved tables
    const reservedTablesQuery = `
      SELECT r.tableid
      FROM tblreservation AS r
      WHERE r.reserveday = ?
        AND r.formtime <= ?
        AND r.totime >= ?
        AND r.status = 1
    `;

    // Execute reserved tables query
    db.pool.query(
      reservedTablesQuery,
      [formattedDateStr, formtime, totime],
      (err, reservedResults) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Database query failed" });
        }

        const reservedTableIds = reservedResults.map((row) => row.tableid);

        // Query to find available tables
        const availableTablesQuery = reservedTableIds.length > 0
          ? `
              SELECT *
              FROM rest_table
              WHERE tableid NOT IN (?)
                AND status = 0
            `
          : `
              SELECT *
              FROM rest_table
              WHERE status = 0
            `;

        const queryParams = reservedTableIds.length > 0 ? [reservedTableIds] : [];

        db.pool.query(availableTablesQuery, queryParams, (err, availableResults) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Database query failed" });
          }

          if (availableResults.length > 0) {
            return res.status(200).json({ data: availableResults });
          } else {
            return res.status(404).json({ message: "No tables available for the given criteria" });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error in getAvailableReservationTables:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
// get all reservation data
const getReservations = async (req, res) => {
  try {
    const { searchItem } = req.query;
    console.log(searchItem);

    let query = `
          SELECT 
              ci.customer_name, 
              rt.tablename, 
              r.person_capicity, 
              r.formtime AS start_time, 
              r.totime AS end_time, 
              r.reserveday AS date, 
              r.reserveid,
              CASE 
                  WHEN r.status = 0 THEN 'free' 
                  WHEN r.status = 1 THEN 'Booked' 
                  ELSE 'unknown' 
              END AS status 
          FROM 
              tblreservation r
          JOIN 
              customer_info ci ON r.cid = ci.customer_id
          JOIN 
              rest_table rt ON r.tableid = rt.tableid
          WHERE 1=1
      `;

    let queryParams = [];

    if (searchItem && searchItem.trim() !== "") {
      // Append search criteria for fields including status
      query += ` AND (
              ci.customer_name LIKE ? OR 
              rt.tablename LIKE ? OR 
              r.person_capicity LIKE ? OR 
              r.formtime LIKE ? OR 
              r.totime LIKE ? OR 
              r.reserveday LIKE ? OR 
              r.reserveid LIKE ? OR
              (CASE 
                  WHEN r.status = 0 THEN 'free' 
                  WHEN r.status = 1 THEN 'Booked' 
              END) LIKE ?
          )`;

      // Add parameters for general search
      const searchQuery = `%${searchItem}%`;
      queryParams = [
        searchQuery, // customer_name
        searchQuery, // tablename
        searchQuery, // person_capicity
        searchQuery, // formtime
        searchQuery, // totime
        searchQuery, // reserveday
        searchQuery, // reserveid
        searchQuery, // status ('free' or 'Booked')
      ];
    }

    // Add the ORDER BY clause outside of the search conditions
    query += ` ORDER BY r.reserveid DESC`;

    // Execute the query
    db.pool.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Database query error" });
      }

      res.status(200).json({ data: results });
    });
  } catch (error) {
    console.error("Error occurred while retrieving reservations:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving reservations" });
  }
};




// get table byidreservation
const getTableByIdreservation = async (req, res) => {
  const { tableid } = req.params; // Retrieve tableid from request parameters

  try {
    // SQL query to get table details by tableid
    const getTableByIdQuery = `
         SELECT tableid, tablename, person_capicity
      FROM rest_table
      WHERE rest_table.status = 0
      AND tableid=?

      `;

    db.pool.query(getTableByIdQuery, [tableid], (err, results) => {
      if (err) {
        console.error("Error retrieving table by ID:", err);
        return res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while retrieving the table",
          });
      }

      // Check if the table was found
      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Table not found" });
      }

      // Return the found table data
      res.status(200).json({ success: true, data: results[0] });
    });
  } catch (error) {
    console.error("Error in getTableById:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// reservation setting
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

const updatereservationsetting = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const { reservation_open, reservation_close, maxreserveperson } = req.body;

    // Fetch the current settings by id
    const selectSql = "SELECT * FROM setting WHERE id = ?";
    const currentSetting = await dbQuery(selectSql, [id]);

    if (currentSetting.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Setting not found" });
    }

    // Update only the specified fields, while keeping the other fields unchanged
    const updateSql = `
        UPDATE setting 
        SET 
          reservation_open = ?, 
          reservation_close = ?, 
          maxreserveperson = ?
        WHERE id = ?`;

    const updateParams = [
      reservation_open || currentSetting[0].reservation_open, // Use the new value or keep the old one
      reservation_close || currentSetting[0].reservation_close,
      maxreserveperson || currentSetting[0].maxreserveperson,
      id,
    ];

    await dbQuery(updateSql, updateParams);

    res
      .status(200)
      .json({
        success: true,
        message: "Reservation setting updated successfully",
      });
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while updating reservation setting",
      });
  }
};
// delete reservation
const deleteReservation = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const deleteReservationQuery =
    "DELETE FROM tblreservation WHERE reserveid = ?";

  try {
    // Delete reservation from tblreservation table
    db.pool.query(deleteReservationQuery, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      res.status(200).json({ message: "Reservation deleted successfully" });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the reservation" });
  }
};

const getReservationById = async (req, res) => {
    const { id } = req.params; 

    const query = `
        SELECT 
            ci.customer_name, 
            rt.tablename, 
            r.person_capicity, 
            r.formtime AS start_time, 
            r.totime AS end_time, 
            r.reserveday AS date, 
            ci.customer_email,
            ci.customer_phone,
            r.reserveid,
            CASE 
                WHEN r.status = 0 THEN 'free' 
                WHEN r.status = 1 THEN 'Booked' 
                ELSE 'unknown' 
            END AS status 
        FROM 
            tblreservation r
        JOIN 
            customer_info ci ON r.cid = ci.customer_id
        JOIN 
            rest_table rt ON r.tableid = rt.tableid
        WHERE 
            r.reserveid = ? 
    `;

    try {
        db.pool.query(query, [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database query error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            res.status(200).json({data:result[0]}); // Return the first result as it's by ID
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the reservation' });
    }
};
const updateReservationAndCustomer = async (req, res) => {
  const { reserveid } = req.params; // Get the reserve ID from the URL parameters
  const { customer_name, customer_email, customer_phone, formtime, totime, reserveday } = req.body; // Get all the parameters from the request body

  // SQL Queries
  const getReservationDataQuery = 'SELECT * FROM tblreservation WHERE reserveid = ?';
  const updateCustomerQuery = 'UPDATE customer_info SET customer_name = ?, customer_email = ?, customer_phone = ? WHERE customer_id = ?';
  const updateReservationQuery = 'UPDATE tblreservation SET totime = ?, formtime = ?, reserveday = ? WHERE reserveid = ?';

  try {
      // Get reservation data including all fields
      db.pool.query(getReservationDataQuery, [reserveid], (err, reservationResults) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ success: false, message: 'An error occurred while retrieving reservation data' });
          }

          if (reservationResults.length === 0) {
              return res.status(404).json({ success: false, message: 'Reservation not found' });
          }

          const reservationData = reservationResults[0];
          const customer_id = reservationData.cid;

          // Fetch current customer info
          db.pool.query('SELECT * FROM customer_info WHERE customer_id = ?', [customer_id], (err, customerResults) => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ success: false, message: 'An error occurred while retrieving customer data' });
              }

              const currentCustomerData = customerResults[0];

              // Prepare updated customer data
              const updatedCustomerData = {
                  customer_name: customer_name !== undefined ? customer_name : currentCustomerData.customer_name,
                  customer_email: customer_email !== undefined ? customer_email : currentCustomerData.customer_email,
                  customer_phone: customer_phone !== undefined ? customer_phone : currentCustomerData.customer_phone
              };

              // Update customer_info table
              db.pool.query(updateCustomerQuery, [updatedCustomerData.customer_name, updatedCustomerData.customer_email, updatedCustomerData.customer_phone, customer_id], (err) => {
                  if (err) {
                      console.error(err);
                      return res.status(500).json({ success: false, message: 'An error occurred while updating customer info' });
                  }

                  // Prepare updated reservation data
                  const updatedReservationData = {
                      totime: totime !== undefined ? totime : reservationData.totime,
                      formtime: formtime !== undefined ? formtime : reservationData.formtime,
                      reserveday: reserveday !== undefined ? reserveday : reservationData.reserveday
                  };

                  // Update reservation table
                  db.pool.query(updateReservationQuery, [updatedReservationData.totime, updatedReservationData.formtime, updatedReservationData.reserveday, reserveid], (err) => {
                      if (err) {
                          console.error(err);
                          return res.status(500).json({ success: false, message: 'An error occurred while updating reservation info' });
                      }

                      res.status(200).json({ success: true, message: 'Reservation and customer info updated successfully' });
                  });
              });
          });
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred while updating reservation and customer info' });
  }
};
module.exports = {
  createUnavailability,
  getUnavailability,
  deleteUnavailability,
  getUnavailabilitybyid,
  updateUnavailability,
  getReservations,
  updatereservationsetting,
  getavailablereservationtables,
  createReservation,
  getTableByIdreservation,
  deleteReservation,
  getReservationById,
  updateReservationAndCustomer
};
