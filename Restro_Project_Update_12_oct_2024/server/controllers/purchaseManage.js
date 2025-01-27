const db = require("../utils/db");



const getPurchaseItemDetails = (req, res) => {
  const { searchItem } = req.query; // Assuming searchItem comes from query parameters

  let getPurchaseItemDetailsQuery = `
    SELECT
      p.*,
      s.supName as suppliername,
      p.purchasedate,
      p.total_price,
      p.invoiceid
    FROM 
      purchaseitem p
    LEFT JOIN 
      supplier s
    ON 
      p.suplierID = s.supid
    WHERE 1=1`;  // Placeholder for easier query appending

  if (searchItem) {
    getPurchaseItemDetailsQuery += `
      AND (s.supName LIKE ?
           OR p.purchasedate LIKE ?
           OR p.total_price LIKE ?
           OR p.invoiceid LIKE ?)`;
  }

  // Wildcard for partial match
  const searchValue = `%${searchItem}%`;
  const values = [searchValue, searchValue, searchValue, searchValue];
  getPurchaseItemDetailsQuery += ` ORDER BY p.purID DESC`;

  // If no searchItem is provided, values will not be used
  db.pool.query(getPurchaseItemDetailsQuery, searchItem ? values : [], (err, result) => {
    if (err) {
      console.error('Error fetching purchase item details:', err);
      return res.status(500).send('Server error');
    }

    if (result.length === 0) {
      return res.status(404).send('No purchase items found');
    }

    res.status(200).json({data:result});
  });
};
  // get by id
const getPurchaseItemById = (req, res) => {
  const { id } = req.params;

  // Fetch purchase item data
  const getPurchaseItemQuery = `SELECT * FROM purchaseitem WHERE purID = ?`;
  db.pool.query(getPurchaseItemQuery, [id], (err, purchaseItemResult) => {
    if (err) {
      console.error('Error fetching purchase item:', err);
      return res.status(500).send('Server error');
    }

    if (purchaseItemResult.length === 0) {
      return res.status(404).send('Purchase item not found');
    }

    const purchaseItem = purchaseItemResult[0];
    let paymentType = '';

    // Determine payment type
    if (purchaseItem.bankid) {
      const getBankNameQuery = `SELECT bank_name FROM tbl_bank WHERE bankid = ?`;
      db.pool.query(getBankNameQuery, [purchaseItem.bankid], (err, bankResult) => {
        if (err) {
          console.error('Error fetching bank name:', err);
          return res.status(500).send('Server error');
        }

        paymentType = bankResult.length > 0 ? bankResult[0].bank_name : 'Unknown Bank Payment';
        fetchPurchaseDetails(purchaseItem, paymentType);
      });
    } else {
      paymentType = 'Cash Payment';
      fetchPurchaseDetails(purchaseItem, paymentType);
    }

    // Function to fetch purchase details
    function fetchPurchaseDetails(purchaseItem, paymentType) {
      const getPurchaseDetailsQuery = `SELECT * FROM purchase_details WHERE purchaseid = ?`;
      db.pool.query(getPurchaseDetailsQuery, [purchaseItem.purID], (err, purchaseDetailsResult) => {
        if (err) {
          console.error('Error fetching purchase details:', err);
          return res.status(500).send('Server error');
        }

        // Fetch ingredient names for each purchase detail
        const ingredientIds = purchaseDetailsResult.map(detail => detail.indredientid);
        if (ingredientIds.length > 0) {
          const getIngredientNamesQuery = `SELECT * FROM ingredients WHERE id IN (?)`;
          db.pool.query(getIngredientNamesQuery, [ingredientIds], (err, ingredientsResult) => {
            if (err) {
              console.error('Error fetching ingredient names:', err);
              return res.status(500).send('Server error');
            }

            // Map ingredient names to purchase details
            const ingredientsMap = {};
            ingredientsResult.forEach(ingredient => {
              ingredientsMap[ingredient.id] = ingredient;
            });

            const purchaseDetailsWithIngredients = purchaseDetailsResult.map(detail => ({
              ...detail,
              ingredient: ingredientsMap[detail.indredientid] || 'Unknown'
            }));

            fetchSupplierLedger(purchaseItem, purchaseDetailsWithIngredients, paymentType);
          });
        } else {
          fetchSupplierLedger(purchaseItem, [], paymentType);
        }
      });
    }

    // Function to fetch supplier ledger and complete the response
    function fetchSupplierLedger(purchaseItem, purchaseDetailsWithIngredients, paymentType) {
      // Fetch supplier name
      const getSupplierNameQuery = `SELECT supName FROM supplier WHERE supid = ?`;
      db.pool.query(getSupplierNameQuery, [purchaseItem.suplierID], (err, supplierNameResult) => {
        if (err) {
          console.error('Error fetching supplier name:', err);
          return res.status(500).send('Server error');
        }

        const supplierName = supplierNameResult.length > 0 ? supplierNameResult[0].supName : 'Unknown Supplier';

        // Map the response structure
        const response = {
          purchaseitem: [{

            paymentTypeid:purchaseItem.paymenttype,
            suplierID:purchaseItem.suplierID,
            invoiceid: purchaseItem.invoiceid,
            supplierName: supplierName,
            purchasedate: purchaseItem.purchasedate,
            purchaseexpiredate: purchaseItem.purchaseexpiredate,
            details: purchaseItem.detail,
            total_price:purchaseItem.total_price,
            details:purchaseItem.details,
            bank_name: paymentType,
            paid_amount:purchaseItem.paid_amount,
            bankid:purchaseItem.bankid,

          }],
          itemdetails: purchaseDetailsWithIngredients.map(detail => ({
            indredientid: detail.ingredient.ingredient_name,
            ingredientids:detail.indredientid,
            quantity: detail.quantity,
            totalprice: detail.price,
            stocky_quantity: detail.ingredient.stock_qty
          }))
        };

        // Return the response
        return res.status(200).json({data:response});
      });
    }
  });
};
const getReturnpurchase = (req, res) => {
  const { searchItem } = req.query; // Get search term from query parameters

  // Base query
  let query = `
    SELECT 
      purchase_return.*, 
      supplier.supName
    FROM 
      purchase_return
    LEFT JOIN 
      supplier 
    ON 
      purchase_return.supplier_id = supplier.supid
    WHERE 1=1`;  
  // Check if search term is provided
  if (searchItem) {
    query += `
      AND (supplier.supName LIKE ?
           OR purchase_return.po_no LIKE ? 
           OR purchase_return.return_date LIKE ?
           OR purchase_return.totalamount LIKE ?)`;
  }

  // Wildcard for partial match
  const searchValue = `%${searchItem}%`;
  const values = [searchValue, searchValue, searchValue, searchValue];

  // Add ordering clause
  query += ` ORDER BY purchase_return.preturn_id DESC`;

  db.pool.query(query, searchItem ? values : [], (err, results) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
     
      return res.status(200).json({data:results});
    } else {
      return res.status(404).send('No invoices found');
    }
  });
};
// get all suppliers
const getAllSuppliers = (req, res) => {
  const { searchItem } = req.query; // Get searchItem from query parameters

  // Base query to get supplier information and compute due balance
  let query = `
    SELECT 
      supplier.supid,
      supplier.supName, 
      supplier.supEmail, 
      supplier.supMobile, 
      supplier.supAddress,
      
 SUM(CASE WHEN d_c = 'c' THEN amount ELSE 0 END) AS total_credit_amount,
  SUM(CASE WHEN d_c = 'd' THEN amount ELSE 0 END) AS total_debit_amount,
  (SUM(CASE WHEN d_c = 'd' THEN amount ELSE 0 END) - SUM(CASE WHEN d_c = 'c' THEN amount ELSE 0 END)) AS total_balance






    FROM supplier 
    LEFT JOIN supplier_ledger ON supplier_ledger.supplier_id = supplier.supid
  `;

  let queryParams = [];

  // Check if searchItem is provided and add WHERE clause for filtering
  if (searchItem) {
    let searchValue = `%${searchItem}%`; // Wildcard for partial match
    query += `
      WHERE supplier.supid LIKE ? 
      OR supplier.supName LIKE ? 
      OR supplier.supEmail LIKE ? 
      OR supplier.supMobile LIKE ? 
      OR supplier.supAddress LIKE ?
     
    `;
    queryParams = [searchValue, searchValue, searchValue, searchValue, searchValue]; // Add all parameters for LIKE conditions
  }

  // Group by supplier to calculate balance per supplier
  query += ` GROUP BY supplier.supid ORDER BY supplier.supid DESC `;

  // Execute the query with or without search filtering
  db.pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching suppliers:', err);
      res.status(500).json({ success: false, message: 'An error occurred while fetching suppliers' });
    } else {
      res.status(200).json({ success: true, data: results, message: 'Suppliers fetched successfully' });
    }
  });
};

// create supplier
const createSupplier = (req, res) => {
  const { supName, supEmail, supMobile, supAddress, amount } = req.body;

  // Query to get the highest existing suplier_code
  const getMaxSupplierCodeQuery = 'SELECT suplier_code FROM supplier ORDER BY suplier_code DESC LIMIT 1';

  db.pool.query(getMaxSupplierCodeQuery, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching supplier code' });
    }
    let newSupplierCode;
    if (results.length > 0) {
      const highestSupplierCode = results[0].suplier_code;
      const codeNumber = parseInt(highestSupplierCode.split('_')[1]) + 1;
      newSupplierCode = `sup_${codeNumber.toString().padStart(3, '0')}`;
    } else {
      newSupplierCode = 'sup_001';
    }
    

    // Insert into supplier table
    const insertSupplierQuery = 'INSERT INTO supplier (suplier_code, supName, supEmail, supMobile, supAddress) VALUES (?, ?, ?, ?, ?)';
    db.pool.query(insertSupplierQuery, [newSupplierCode, supName, supEmail, supMobile, supAddress], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'An error occurred while creating the supplier' });
      }

      const supplierId = results.insertId; // Capture the inserted supplier's ID
const newdate=new Date().toISOString().split('T')[0];
const new_chalan_no="Adjustment"
const new_description="Previous adjustment with software"
      // Insert into supplier_ledger table
      const insertSupplierLedgerQuery = 'INSERT INTO supplier_ledger (supplier_id, amount,date,description,chalan_no,transaction_id,status,d_c) VALUES (?,?,?,?,?,?,?, ?)';
      db.pool.query(insertSupplierLedgerQuery, [supplierId, amount,newdate,new_description,new_chalan_no,newSupplierCode,1,"c"	], (err, ledgerResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'An error occurred while inserting into supplier ledger' });
        }

        return res.status(201).json({ success: true, message: 'Supplier and ledger entry created successfully' });
      });
    });
  });
};


const stockOutIngredients = (req, res) => {
  const { searchItem } = req.query;

  // Base query
  let query = `
    SELECT A.id, A.ingredient_name, A.stock_qty, A.min_stock 
    FROM ingredients A 
    WHERE EXISTS (
      SELECT B.id 
      FROM ingredients B 
      WHERE B.id = A.id 
      AND B.ingredient_name = A.ingredient_name 
      AND B.stock_qty < A.min_stock
    )
  `;

  let queryParams = [];

  // Add search filter if searchItem is provided
  if (searchItem) {
    const searchValue = `%${searchItem}%`; // Wildcard for partial match
    query += `
      AND (
        A.ingredient_name LIKE ? 
        OR A.stock_qty LIKE ? 
        OR A.min_stock LIKE ?
      )
    `;
    queryParams = [searchValue, searchValue, searchValue];
  }

  // Add the ORDER BY clause
  query += ` ORDER BY A.id DESC`;

  // Execute the query with or without search filtering
  db.pool.query(query, queryParams, (err, outStockResults) => {
    if (err) {
      console.error('Error fetching stock-out ingredients:', err);
      return res.status(500).send({ message: 'Server error', error: err.message });
    }

    if (outStockResults.length === 0) {
      return res.status(404).send({ message: 'No stock-out ingredients found' });
    }

    // If successful, return the out-of-stock ingredients
    return res.status(200).json({ message: 'Stock-out ingredients fetched successfully', data: outStockResults });
  });
};
// delete supplier
const deleteSupplier = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM supplier WHERE supid=?';
  db.pool.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'An error occurred' });
    } else {
      res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
    }
  });
};
 const updateSupplier = (req, res) => {
  const { id } = req.params;
  const { supName, supEmail, supMobile, supAddress } = req.body;

  const query = 'SELECT * FROM supplier WHERE supid = ?';
  db.pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving supplier:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while retrieving the supplier' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const currentData = results[0];
    const updateData = {
      supName: supName !== undefined ? supName : currentData.supName,
      supEmail: supEmail !== undefined ? supEmail : currentData.supEmail,
      supMobile: supMobile !== undefined ? supMobile : currentData.supMobile,
      supAddress: supAddress !== undefined ? supAddress : currentData.supAddress,
    };

    const updateSupplierQuery = `
      UPDATE supplier 
      SET supName = ?, supEmail = ?, supMobile = ?, supAddress = ?
      WHERE supid = ?
    `;
    const values = [updateData.supName, updateData.supEmail, updateData.supMobile, updateData.supAddress, id];

    db.pool.query(updateSupplierQuery, values, (err, result) => {
      if (err) {
        console.error('Error updating supplier:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while updating the supplier' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      } else {
        return res.status(200).json({ success: true, message: 'Supplier updated successfully' });
      }
    });
  });
}

const getSupplierById = (req, res) => {
  const { id } = req.params; // Get supplier ID from request parameters

  // Query to get supplier details by ID
  const query = `
    SELECT 
     *
    FROM supplier 
    WHERE supplier.supid = ?
  `;

  // Execute the query
  db.pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching supplier by ID:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching supplier' });
    } else if (results.length === 0) {
      // No supplier found with the given ID
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    } else {
      return res.status(200).json({ success: true, data: results[0], message: 'Supplier fetched successfully' });
    }
  });
};

// add purchase
const createPurchaseItem = (req, res) => {
  const {
    purchasedetail,  // Frontend sends this array for purchase item details
    itemdetails,     // Frontend sends this array for item details (ingredients)
  } = req.body;

  const {
    invoiceid,
    paymenttype,
    total_price,
    paid_amount,
    details,
    purchasedate,
    purchaseexpiredate,
     // Default to "useradmin" if not provided
    finalBankId,
    suplierID,
  } = purchasedetail[0]; // Assuming purchase details are in the first object
const savedby = req.id;
  // Determine finalBankId based on paymenttype
  let finalBankIdToUse = null;
  if (paymenttype === 1) { // Assuming 1 corresponds to bank payment
    finalBankIdToUse = finalBankId;
  }

  // Insert into purchaseitem table
  const insertPurchaseItemQuery = `
    INSERT INTO purchaseitem 
      (invoiceid, paymenttype, total_price, paid_amount, details, purchasedate, purchaseexpiredate, savedby, bankid, suplierID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const purchaseItemValues = [
    invoiceid,
    paymenttype,
    total_price,
    paid_amount,
    details,
    purchasedate,
    purchaseexpiredate,
    savedby,  // Use the value of savedby, defaulting to "useradmin" if not provided
    finalBankIdToUse,
    suplierID
  ];

  db.pool.query(insertPurchaseItemQuery, purchaseItemValues, (err, result) => {
    if (err) {
      console.error('Error inserting purchase item:', err);
      return res.status(500).send('Server error');
    }

    const purchaseid = result.insertId;

    // Function to insert purchase details and update stock sequentially
    const insertPurchaseDetails = (index) => {
      if (index >= itemdetails.length) {
        // After inserting all purchase details, update the supplier ledger for credit (total price)


        const updateSupplierLedgerCreditQuery = `
          INSERT INTO supplier_ledger 
            (amount, transaction_id, description, chalan_no, payment_type, status, d_c, date, supplier_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const creditLedgerValues = [
          total_price,
          invoiceid,
         details,
          invoiceid,
          paymenttype,
          1,      // Assuming '1' means active
          'c',    // 'c' stands for credit
          purchasedate,
          suplierID
        ];

        db.pool.query(updateSupplierLedgerCreditQuery, creditLedgerValues, (err, ledgerResult) => {
          if (err) {
            console.error('Error updating supplier ledger (credit):', err);
            return res.status(500).send('Server error');
          }

          // Update supplier ledger for debit (paid amount)
          const debitDescription = `Purchase From Supplier ${details}`;
          const updateSupplierLedgerDebitQuery = `
            INSERT INTO supplier_ledger 
              (amount, transaction_id, description, chalan_no, payment_type, status, d_c, date, supplier_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const debitLedgerValues = [
            paid_amount,
            invoiceid,
            debitDescription,
            invoiceid,
            paymenttype,
            1,       // Assuming '1' means active
            'd',     // 'd' stands for debit
            purchasedate,
            suplierID
          ];

          db.pool.query(updateSupplierLedgerDebitQuery, debitLedgerValues, (err, ledgerResult) => {
            if (err) {
              console.error('Error updating supplier ledger (debit):', err);
              return res.status(500).send('Server error');
            }

            // Final success response after updating both credit and debit in supplier ledger
            return res.status(201).send({
              data: { purchaseItemId: purchaseid },
              message: 'Purchase item, details, and supplier ledger entries created successfully'
            });
          });
        });

        return; // End after supplier ledger update
      }

      const { indredientid, quantity, price } = itemdetails[index];
      const currentTotalPrice = quantity * price; // Calculate total price per product

      // Insert into purchase_details table
      const insertPurchaseDetailQuery = `
        INSERT INTO purchase_details 
          (purchaseid, indredientid, quantity, price, totalprice, purchasedate, purchaseexpiredate, purchaseby)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const purchaseDetailValues = [
        purchaseid,
        indredientid,
        quantity,
        price,
        currentTotalPrice,
        purchasedate,
        purchaseexpiredate,
        savedby
      ];

      db.pool.query(insertPurchaseDetailQuery, purchaseDetailValues, (err, detailResult) => {
        if (err) {
          console.error('Error inserting purchase details:', err);
          return res.status(500).send('Server error');
        }

        // Update stock quantity in ingredients table
        const updateStockQuery = `
          UPDATE ingredients 
          SET stock_qty = stock_qty + ? 
          WHERE id = ?
        `;

        const updateStockValues = [
          quantity,
          indredientid
        ];

        db.pool.query(updateStockQuery, updateStockValues, (err, stockResult) => {
          if (err) {
            console.error('Error updating stock:', err);
            return res.status(500).send('Server error');
          }

          // Proceed to the next item in the itemdetails array
          insertPurchaseDetails(index + 1);
        });
      });
    };

    // Start inserting purchase details from the first item
    insertPurchaseDetails(0);
  });
};


const updatePurchaseItem = (req, res) => {
  const { purchaseid } = req.params;
  console.log("p", purchaseid);
  const {
    purchasedetail, // Frontend sends this array for purchase item details
    itemdetails,    // Frontend sends this array for item details (ingredients)
  } = req.body;

  const {
    invoiceid,
    paymenttype,
    total_price,
    paid_amount,
    details,
    purchasedate,
    purchaseexpiredate,
    savedby = 178,  // Default to "useradmin" if not provided
    finalBankId,
    suplierID,
  } = purchasedetail[0]; // Assuming purchase details are in the first object

  // Determine finalBankId based on paymenttype
  let finalBankIdToUse = null;
  if (paymenttype === 1) { // Assuming 1 corresponds to bank payment
    finalBankIdToUse = finalBankId;
  }

  const getPurchaseItemQuery = 'SELECT * FROM purchaseitem WHERE purID = ?';
  db.pool.query(getPurchaseItemQuery, [purchaseid], (err, currentPurchaseItem) => {
    if (err) {
      console.error('Error fetching purchase item:', err);
      return res.status(500).send('Server error');
    }

    if (currentPurchaseItem.length === 0) {
      return res.status(404).send('Purchase item not found');
    }

    const currentData = currentPurchaseItem[0];

    // Merge new data with existing data
    const updatedData = {
      invoiceid: invoiceid !== undefined ? invoiceid : currentData.invoiceid,
      paymenttype: paymenttype !== undefined ? paymenttype : currentData.paymenttype,
      total_price: total_price !== undefined ? total_price : currentData.total_price,
      paid_amount: paid_amount !== undefined ? paid_amount : currentData.paid_amount,
      details: details !== undefined ? details : currentData.details,
      purchasedate: purchasedate !== undefined ? purchasedate : currentData.purchasedate,
      purchaseexpiredate: purchaseexpiredate !== undefined ? purchaseexpiredate : currentData.purchaseexpiredate,
      savedby: savedby !== undefined ? savedby : currentData.savedby,
      bankid: finalBankIdToUse !== undefined ? finalBankIdToUse : currentData.bankid,
      suplierID: suplierID !== undefined ? suplierID : currentData.suplierID,
    };

    // Update purchase item
    const updatePurchaseItemQuery = `
      UPDATE purchaseitem 
      SET 
        invoiceid = ?, 
        paymenttype = ?, 
        total_price = ?, 
        paid_amount = ?, 
        details = ?, 
        purchasedate = ?, 
        purchaseexpiredate = ?, 
        savedby = ?, 
        bankid = ?, 
        suplierID = ?
      WHERE 
        purID = ?
    `;
    const purchaseItemValues = [
      updatedData.invoiceid,
      updatedData.paymenttype,
      updatedData.total_price,
      updatedData.paid_amount,
      updatedData.details,
      updatedData.purchasedate,
      updatedData.purchaseexpiredate,
      updatedData.savedby,
      updatedData.bankid,
      updatedData.suplierID,
      purchaseid, 
    ];

    db.pool.query(updatePurchaseItemQuery, purchaseItemValues, (err, result) => {
      if (err) {
        console.error('Error updating purchase item:', err);
        return res.status(500).send('Server error');
      }

      // First, delete existing purchase details before inserting new ones
      const deletePurchaseDetailsQuery = `DELETE FROM purchase_details WHERE purchaseid = ?`;

      db.pool.query(deletePurchaseDetailsQuery, [purchaseid], (err, deleteResult) => {
        if (err) {
          console.error('Error deleting existing purchase details:', err);
          return res.status(500).send('Server error');
        }

        // Function to insert new purchase details and update stock sequentially
        const insertPurchaseDetails = (index) => {
          if (index >= itemdetails.length) {
            // After inserting all purchase details, update supplier ledger

            const updateSupplierLedgerCreditQuery = `
              UPDATE supplier_ledger 
              SET amount = ?, description = ?, chalan_no = ?, payment_type = ?, date = ?, transaction_id = ?, supplier_id = ?
              WHERE transaction_id = ? AND d_c = 'c'
            `;

            const creditLedgerValues = [
              updatedData.total_price,
              updatedData.details,
              updatedData.invoiceid,
              updatedData.paymenttype,
              updatedData.purchasedate,
              updatedData.invoiceid,
              updatedData.suplierID,
              currentData.invoiceid,  // transaction_id (updated)
            ];

            db.pool.query(updateSupplierLedgerCreditQuery, creditLedgerValues, (err, ledgerResult) => {
              if (err) {
                console.error('Error updating supplier ledger (credit):', err);
                return res.status(500).send('Server error');
              }

              // Update supplier ledger for debit (paid amount)
              const debitDescription = `Purchase From Supplier ${updatedData.details}`; 
              const updateSupplierLedgerDebitQuery = `
                UPDATE supplier_ledger 
                SET amount = ?, description = ?, chalan_no = ?, payment_type = ?, date = ?, transaction_id = ?, supplier_id = ?
                WHERE transaction_id = ? AND d_c = 'd'
              `;

              const debitLedgerValues = [
                updatedData.paid_amount,
                debitDescription,
                updatedData.invoiceid,
                updatedData.paymenttype,
                updatedData.purchasedate,
                updatedData.invoiceid,
                updatedData.suplierID,
                currentData.invoiceid,
              ];

              db.pool.query(updateSupplierLedgerDebitQuery, debitLedgerValues, (err, ledgerResult) => {
                if (err) {
                  console.error('Error updating supplier ledger (debit):', err);
                  return res.status(500).send('Server error');
                }

                // Final success response after updating both credit and debit in supplier ledger
                return res.status(200).send({
                  data: { purchaseItemId: purchaseid },
                  message: 'Purchase item, details, and supplier ledger entries updated successfully'
                });
              });
            });

            return; // End after supplier ledger update
          }

          const { indredientid, quantity, price } = itemdetails[index];
          const currentTotalPrice = quantity * price; // Calculate total price per product

          // Insert into purchase_details table
          const insertPurchaseDetailQuery = `
            INSERT INTO purchase_details 
              (purchaseid, indredientid, quantity, price, totalprice, purchasedate, purchaseexpiredate, purchaseby)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const purchaseDetailValues = [
            purchaseid,
            indredientid,
            quantity,
            price,
            currentTotalPrice,
            updatedData.purchasedate,
            updatedData.purchaseexpiredate,
            savedby,
          ];

          db.pool.query(insertPurchaseDetailQuery, purchaseDetailValues, (err, detailResult) => {
            if (err) {
              console.error('Error inserting purchase details:', err);
              return res.status(500).send('Server error');
            }

            // Update stock quantity in ingredients table
            const updateStockQuery = `
              UPDATE ingredients 
              SET stock_qty = stock_qty + ? 
              WHERE id = ?
            `;

            const updateStockValues = [quantity, indredientid];

            db.pool.query(updateStockQuery, updateStockValues, (err, stockResult) => {
              if (err) {
                console.error('Error updating stock:', err);
                return res.status(500).send('Server error');
              }

              // Proceed to the next item in the itemdetails array
              insertPurchaseDetails(index + 1);
            });
          });
        };

        // Start inserting purchase details from the first item
        insertPurchaseDetails(0);
      });
    });
  });
};


const getAllStockIngredients = async (req, res) => {
  const query = 'SELECT * FROM ingredients';
  
  db.pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data from ingredients table: ', err);
          return res.status(500).json({ message: 'Database error' });
      }
      res.json({data:results});
  });
};

// accourding to serach get invoice 

const fetchInvoiceIdThroughSupplier = (req, res) => {
  const {suplierID} = req.query;

  const sql = 'SELECT invoiceid FROM purchaseitem WHERE suplierID = ?';
  db.pool.query(sql, [suplierID], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.status(200).send({ data: data });
  });
}; 

// search purchase return accourding to data

const invoiceBySupplier = (req, res) => {
  console.log("Request received for invoiceBySupplier");
  const { supplierID, invoiceID } = req.query;

  console.log('Supplier ID       :', supplierID, 'Invoice ID:', invoiceID);

  const query = `SELECT * FROM purchaseitem WHERE suplierID = ? AND invoiceid = ?`;
  db.pool.query(query, [supplierID, invoiceID], (err, results) => {
    if (err) {
      console.error('Error fetching invoice by supplier:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      const purID = results[0].purID;

      // Modify query2 to join the ingredients table and fetch ingredient_name
      const query2 = `
        SELECT pd.*, i.*,i.ingredient_name
        FROM purchase_details pd
        JOIN ingredients i ON pd.indredientid = i.id
        WHERE pd.purchaseid = ? AND i.is_active = 1
      `;

      db.pool.query(query2, [purID], (err, result2) => {
        if (err) {
          console.error('Error fetching purchase details with ingredient names:', err);
          return res.status(500).send('Server error');
        }

        // Array to store the combined purchase details
        const purchaseDetailsArray = [];

        result2.forEach(item => {
          // Push each item's details as an object including ingredient_name
          purchaseDetailsArray.push({
            ingredient: item.indredientid,
            ingredient_name: item.ingredient_name,
           
            price: item.price,
            purchase_quantity: item.quantity,
            return_quantity:0,
            stockqty:item.stock_qty,
            discount:0,
            total:0,
            return_date:new Date().toISOString().split('T')[0],
        
          });
        });

        // Send the data back with the combined array of objects
        return res.status(200).json({ 
         data:{
          invoice: results, 
          purchaseDetails: purchaseDetailsArray
         } 
        });
      });
    } else {
      return res.status(404).send('No invoices found for this supplier');
    }
  });
};


const purReturnInsert = (req, res) => {
  const {
    returnpurchasedetail, // Frontend sends this array for return purchase details
    itemdetails,          // Frontend sends this array for item details (products)
  } = req.body;

  const {
    poNO,
    supplier_id,
    return_date,
    totalamount,
    return_reason,
  } = returnpurchasedetail[0]; // Assuming the return details are in the first object

  const createDate = new Date(); // Current date
  const createby=req.id;

  // Prepare data for inserting into purchase_return table
  const postData = {
    po_no: poNO,
    supplier_id: supplier_id,
    return_date: return_date,
    totalamount: totalamount,
    return_reason: return_reason,
    createdate: createDate,
    createby:createby,
  };

  console.log('Inserting into purchase_return table', postData);

  // Insert into purchase_return table
  db.pool.query('INSERT INTO purchase_return SET ?', postData, (err, result) => {
    if (err) {
      console.error('Error inserting purchase return:', err);
      return res.status(500).send('Error inserting purchase return');
    }

    const returnID = result.insertId; // Get the newly inserted return ID
    console.log('Inserted into purchase_return, return ID:', returnID);

    // Update purchase item total price based on po_no
    const getPurchaseQuery = 'SELECT * FROM purchaseitem WHERE invoiceid = ?';
    db.pool.query(getPurchaseQuery, [poNO], (err, purchaseResult) => {
      if (err) {
        console.error('Error fetching purchase item:', err);
        return res.status(500).send('Error fetching purchase item');
      }

      if (!purchaseResult.length) {
        console.error('No purchase item found for po_no:', poNO);
        return res.status(404).send('Purchase item not found');
      }

      const purchaseID = purchaseResult[0].purID;
      const updatedGrandTotal = purchaseResult[0].total_price - totalamount;

      console.log('Updating purchase item total_price', updatedGrandTotal);

      const updatePurchaseQuery = 'UPDATE purchaseitem SET total_price = ? WHERE invoiceid = ?';
      db.pool.query(updatePurchaseQuery, [updatedGrandTotal, poNO], (err) => {
        if (err) {
          console.error('Error updating purchase item:', err);
          return res.status(500).send('Error updating purchase item');
        }

        console.log('Purchase item total_price updated');

        // Function to process each item in itemdetails array
        const processReturnItems = (index) => {
          if (index >= itemdetails.length) {
            console.log('All return items processed successfully');
            return res.status(200).send('Purchase return and stock updated successfully');
          }
        
          const { product_id, total_qntt, product_rate, total_price, discount } = itemdetails[index];
          console.log(`Processing item ${index + 1}:`, product_id);
        
          const returnDetailsData = {
            preturn_id: returnID,
            product_id: product_id,
            qty: total_qntt,
            product_rate: product_rate,
            discount: discount || 0, // Assuming discount is optional
          };
        
          console.log('Inserting into purchase_return_details', returnDetailsData);
        
          // Insert into purchase_return_details
          db.pool.query('INSERT INTO purchase_return_details SET ?', returnDetailsData, (err) => {
            if (err) {
              console.error('Error inserting return details:', err);
            } else {
              console.log('Inserted into purchase_return_details');
            }
        
            // Fetch purchase details to adjust quantity and total price
            const getPurchaseDetailQuery = 'SELECT * FROM purchase_details WHERE purchaseid = ? AND indredientid = ?';
            db.pool.query(getPurchaseDetailQuery, [purchaseID, product_id], (err, purchaseDetailResult) => {
              if (err || purchaseDetailResult.length === 0) {
                if (err) {
                  console.error('Error fetching purchase details:', err);
                } else {
                  console.error('No purchase details found for product:', product_id);
                }
        
                // Continue to the next item even if current one fails
                return processReturnItems(index + 1);
              }
        
              const purchaseDetail = purchaseDetailResult[0];
              const adjustedQty = purchaseDetail.quantity - total_qntt;
              const adjustedTotalPrice = purchaseDetail.totalprice - total_price;
        
              console.log('Updating purchase_details for product', product_id, {
                adjustedQty, adjustedTotalPrice
              });
        
              const updatePurchaseDetailQuery = `
                UPDATE purchase_details 
                SET quantity = ?, totalprice = ? 
                WHERE purchaseid = ? AND indredientid = ?
              `;
              db.pool.query(updatePurchaseDetailQuery, [adjustedQty, adjustedTotalPrice, purchaseID, product_id], (err) => {
                if (err) {
                  console.error('Error updating purchase details:', err);
                } else {
                  console.log('Purchase details updated for product', product_id);
                }



                
                    // Update stock quantity in ingredients
                    const updateStockQuery = `
                      UPDATE ingredients 
                      SET stock_qty = stock_qty - ? 
                      WHERE id = ?
                    `;
                    db.pool.query(updateStockQuery, [total_qntt, product_id], (err) => {
                      if (err) {
                        console.error('Error updating stock:', err);
                        return res.status(500).send('Error updating stock');
                      }

        
                processReturnItems(index + 1);
                    })
              });
            });
          });
        };
        
        // Start processing items from the first one
        processReturnItems(0);
        
      });
    });
  });
};


const getPurchaseTransactions = (req, res) => {
  const { startDate, endDate, supplier_id } = req.query;
  
  // Check if at least one filter is applied
  if (!supplier_id && (!startDate || !endDate)) {
    return res.status(400).json({ 
      success: false, 
      message: 'At least one filter (supplier_id, startDate, endDate) is required' 
    });
  }

  // Base query
  let query = `
    SELECT 
      si.*,
      s.supplier_id,
      s.chalan_no AS invoice_no,
      s.deposit_no,
      s.description,
      s.d_c,
      s.date,
      CASE 
        WHEN s.d_c = 'c' THEN s.amount 
        ELSE 0 
      END AS credit_amount,
      CASE 
        WHEN s.d_c = 'd' THEN s.amount 
        ELSE 0 
      END AS debit_amount
    FROM supplier_ledger s
    LEFT JOIN supplier si
      ON s.supplier_id = si.supid
    WHERE 1 = 1
  `;

  // Array to hold the query parameters
  const queryParams = [];

  // Conditionally add supplier_id filter if provided
  if (supplier_id) {
    query += " AND s.supplier_id = ?";
    queryParams.push(supplier_id);
  }

  // Conditionally add date range filter if startDate and endDate are provided
  if (startDate && endDate) {
    query += " AND s.date BETWEEN ? AND ?";
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

const  getReturnItemInfoByID = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      pr.preturn_id, 
      pr.supplier_id, 
      pr.po_no AS invoiceno, 
      pr.return_date, 
      pr.totalamount, 
      pr.totaldiscount, 
      pr.return_reason, 
      pr.createby, 
      pr.createdate, 
      pr.updateby, 
      pr.updatedate, 
      s.supName,
      prd.product_id, 
      prd.qty, 
      prd.product_rate, 
      prd.store_id, 
      prd.discount, 
      i.ingredient_name, 
      uom.uom_short_code
    FROM purchase_return_details prd
    LEFT JOIN ingredients i ON prd.product_id = i.id
    INNER JOIN unit_of_measurement uom ON uom.id = i.uom_id
    LEFT JOIN purchase_return pr ON prd.preturn_id = pr.preturn_id
    LEFT JOIN supplier s ON pr.supplier_id = s.supid
    WHERE prd.preturn_id = ?
    ORDER BY pr.preturn_id DESC
  `;

  db.pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching return item info:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      // Extract common fields for the return
      const returnInfo = {
        preturn_id: results[0].preturn_id,
        supplier_id: results[0].supplier_id,
        po_no: results[0].po_no,
        return_date: results[0].return_date,
        totalamount: results[0].totalamount,
        totaldiscount: results[0].totaldiscount,
        return_reason: results[0].return_reason,
        createby: results[0].createby,
        createdate: results[0].createdate,
        updateby: results[0].updateby,
        updatedate: results[0].updatedate,
        supName: results[0].supName,
        items: results.map(row => ({
          product_id: row.product_id,
          qty: row.qty,
          product_rate: row.product_rate,
          store_id: row.store_id,
          discount: row.discount,
          ingredient_name: row.ingredient_name,
          uom_short_code: row.uom_short_code
        }))
      };

      return res.status(200).json({data:returnInfo});
    } else {
      return res.status(404).send('No return items found');
    }
  });
};

  module.exports={
    getPurchaseItemDetails
    ,getReturnpurchase,
    getAllSuppliers,
    createSupplier,
    stockOutIngredients,
    deleteSupplier,
    updateSupplier,
    getSupplierById,
    getAllStockIngredients,
    createPurchaseItem,
    getPurchaseItemById,
    updatePurchaseItem,
    fetchInvoiceIdThroughSupplier,
    invoiceBySupplier,
    purReturnInsert,
    getPurchaseTransactions,
    getReturnItemInfoByID
  
  }