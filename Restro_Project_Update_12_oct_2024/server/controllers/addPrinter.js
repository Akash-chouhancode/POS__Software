const db = require("../utils/db");

const addPrinter = async (req, res) => {
  const {
    printername,
    connectiontype,
    capabilityprofile,
    characterperline,
    IPaddress,
    port,
  } = req.body;
  const created_by=req.id;
  const sql = `INSERT INTO  printers (name,connection_type,capability_profile,char_per_line,ip_address,port,created_by) VALUES (?,?,?,?,?,?,?);`;
  const values = [
    printername,
    connectiontype,
    capabilityprofile,
    characterperline,
    IPaddress,
    port,
    created_by,
  ];
  db.pool.query(sql, values, (err, data) => {
    try {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    } catch (error) {
      console.log(error);
      req.status(400).json({ msg: "unable to submit data" });
    }
  });
};
const getPrinter = async (req, res) => {
  const { searchItem } = req.query;

  try {
    // Initialize the base SQL query
    let sql = "SELECT * FROM printers";
    let queryParams = [];

    if (searchItem && searchItem.trim() !== "") {
      // Add WHERE clause with search filters if searchItem is provided
      sql += `
        WHERE name LIKE ? 
        OR connection_type LIKE ? 
        OR capability_profile LIKE ? 
        OR char_per_line LIKE ? 
        OR ip_address LIKE ? 
        OR port LIKE ?
      `;
      
      // Using wildcards for partial matching
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery];
    }

    // Add ORDER BY clause at the end
    sql += " ORDER BY id DESC";

    // Execute the query
    db.pool.query(sql, queryParams, (err, data) => {
      if (err) {
        console.error("Error fetching data from printers:", err);
        return res.status(500).send({ error: "Unable to fetch data", details: err });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};



const getPrinterById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Printer ID is required' });
  }

  const sql = "SELECT * FROM printers WHERE id = ?";

  db.pool.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Unable to fetch data", error: err.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: "Printer not found" });
    }

    return res.status(200).json({ success: true, data: data[0] });
  });
};



const updatePrinter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      printername,
      connectiontype,
      capabilityprofile,
      characterperline,
      IPaddress,
      port,
    } = req.body;

    // Check if the printer exists
    const getPrinterQuery = 'SELECT * FROM printers WHERE id = ?';
    db.pool.query(getPrinterQuery, [id], (err, printerResults) => {
      if (err) {
        console.error('Error retrieving printer:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while retrieving the printer' });
      }

      if (printerResults.length === 0) {
        return res.status(404).json({ success: false, message: 'Printer not found' });
      }

      const currentPrinterData = printerResults[0];

      // Prepare updated data by checking for undefined values
      const updatedData = {
        printername: printername !== undefined ? printername : currentPrinterData.name,
        connectiontype: connectiontype !== undefined ? connectiontype : currentPrinterData.connection_type,
        capabilityprofile: capabilityprofile !== undefined ? capabilityprofile : currentPrinterData.capability_profile,
        characterperline: characterperline !== undefined ? characterperline : currentPrinterData.char_per_line,
        IPaddress: IPaddress !== undefined ? IPaddress : currentPrinterData.ip_address,
        port: port !== undefined ? port : currentPrinterData.port,
      };

      // Update the printer record in the database
      const updatePrinterQuery = `
        UPDATE printers 
        SET name = ?, connection_type = ?, capability_profile = ?, char_per_line = ?, ip_address = ?, port = ? 
        WHERE id = ?
      `;
      const values = [
        updatedData.printername,
        updatedData.connectiontype,
        updatedData.capabilityprofile,
        updatedData.characterperline,
        updatedData.IPaddress,
        updatedData.port,
        id,
      ];

      db.pool.query(updatePrinterQuery, values, (err, result) => {
        if (err) {
          console.error('Error updating printer:', err);
          return res.status(500).json({ success: false, message: 'An error occurred while updating the printer' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Printer not found' });
        }

        // Successfully updated the printer
        return res.status(200).json({ success: true, message: 'Printer updated successfully' });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};



const deletePrinter = async (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM printers WHERE id = ?`;
  db.pool.query(sql, [id], (err, data) => {
    if (err) {
      return res
        .status(500)
        .send({ error: "Unable to delete data", details: err });
    }
    return res.status(200).send('Printer deleted successfully');
  });
};

module.exports = { addPrinter, getPrinter,deletePrinter,getPrinterById ,updatePrinter};
