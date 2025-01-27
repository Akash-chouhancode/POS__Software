const db = require("../utils/db");


const createCommissionSetting = (req, res) => {
  const { pos_id, rate } = req.body;
  const create_by=req.id;
  //there is also creatby column here but now there is no need to createby thats why it is nul;
  const query = 'INSERT INTO payroll_commission_setting (pos_id, rate,create_by) VALUES (?, ?,?)';
  db.pool.query(query, [pos_id, rate,create_by], (err, results) => {
    if (err) {
      console.error('Database insert error:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while creating the commission setting' });
    }
    res.status(201).json({ success: true, message: 'Commission setting created successfully', data: { id: results.insertId, pos_id, rate } });
  });
};


const getCommissionSettingById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT pcs.*, p.position_name, pcs.rate
    FROM payroll_commission_setting pcs
    LEFT JOIN position p ON pcs.pos_id = p.pos_id
    WHERE pcs.id = ?
  `;

  db.pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database fetch error:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching the commission setting' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Commission setting not found' });
    }

    res.status(200).json({ success: true, data: results[0] });
  });
};


const getAllCommissionSettings = (req, res) => {
  const { searchItem } = req.query;
  let query = `
    SELECT pcs.*, p.position_name, pcs.rate
    FROM payroll_commission_setting pcs
    LEFT JOIN position p ON pcs.pos_id = p.pos_id
  `;

  let searchQueryParams = [];
  if (searchItem) {
    query += ` WHERE p.position_name LIKE ? OR pcs.rate LIKE ?`;
    searchQueryParams = [`%${searchItem}%`, `%${searchItem}%`];
  }
query+=` ORDER BY pcs.id DESC`;
  db.pool.query(query, searchQueryParams, (err, results) => {
    if (err) {
      console.error('Database fetch error:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching commission settings' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No records found' });
    }

    res.status(200).json({ success: true, data: results });
  });
};

  
const updateCommissionSetting = (req, res) => {
    const { id } = req.params;
    const { rate } = req.body;
  
    const query = 'SELECT * FROM payroll_commission_setting WHERE id = ?';
    db.pool.query(query, [id], (err, results) => {
      if (err) {
        console.error('Database fetch error:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching the commission setting' });
      }
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Commission setting not found' });
      }
  
      const currentData = results[0];
      const updateData = {
        rate: rate !== undefined ? rate : currentData.rate,

      };
  
      const updateQuery = 'UPDATE payroll_commission_setting SET rate = ? WHERE id = ?';
      db.pool.query(updateQuery, [updateData.rate, id], (err, result) => {
        if (err) {
          console.error('Database update error:', err);
          return res.status(500).json({ success: false, message: 'An error occurred while updating the commission setting' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Commission setting not found' });
        }
        res.status(200).json({ success: true, message: 'Commission setting updated successfully' });
      });
    });
  };
  

const deleteCommissionSetting = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM payroll_commission_setting WHERE id = ?';
  db.pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Database delete error:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while deleting the commission setting' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Commission setting not found' });
    }
    res.status(200).json({ success: true, message: 'Commission setting deleted successfully' });
  });
};


module.exports={
    deleteCommissionSetting,
    updateCommissionSetting,
    getAllCommissionSettings,
    createCommissionSetting,
    getCommissionSettingById

}