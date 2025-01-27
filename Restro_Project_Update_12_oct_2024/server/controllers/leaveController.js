const db = require("../utils/db");

const createHoliday = (req, res) => {
  const { holiday_name, start_date, end_date, no_of_days } = req.body;
  const created_by=req.id;
  
  const sql = 'INSERT INTO payroll_holiday (holiday_name, start_date, end_date, no_of_days,created_by) VALUES (?, ?, ?,?, ?)';
  const values = [holiday_name, start_date, end_date, no_of_days,created_by];
  
  db.pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database insertion error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ success: true, message: 'Holiday created successfully', holidayId: result.insertId });
  });
};
  
const updateHoliday = (req, res) => {
  const { id } = req.params;
  const { holiday_name, start_date, end_date, no_of_days } = req.body;
  const updated_by=req.id;


  const fetchSql = 'SELECT * FROM payroll_holiday WHERE payrl_holi_id = ?';
  
  db.pool.query(fetchSql, [id], (fetchErr, fetchData) => {
    if (fetchErr) {
      console.error('Database fetch error:', fetchErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (fetchData.length === 0) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    const currentData = fetchData[0];

    const updatedData = {
      holiday_name: holiday_name !== undefined ? holiday_name : currentData.holiday_name,
      start_date: start_date !== undefined ? start_date : currentData.start_date,
      end_date: end_date !== undefined ? end_date : currentData.end_date,
      no_of_days: no_of_days !== undefined ? no_of_days : currentData.no_of_days
    
    };

    const updateSql = `
      UPDATE payroll_holiday 
      SET holiday_name = ?, start_date = ?, end_date = ?, no_of_days = ?,updated_by=?
      WHERE payrl_holi_id = ?
    `;
    db.pool.query(updateSql, [
      updatedData.holiday_name,
      updatedData.start_date,
      updatedData.end_date,
      updatedData.no_of_days,
      updated_by,
      id
    ], (updateErr, result) => {
      if (updateErr) {
        console.error('Database update error:', updateErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Holiday not found' });
      }
      res.status(200).json({ success: true, message: 'Holiday updated successfully' });
    });
  });
};
  
  const deleteHoliday = (req, res) => {
    const { id } = req.params;
  
    const sql = 'DELETE FROM payroll_holiday WHERE payrl_holi_id = ?';
  
    db.pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Database deletion error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Holiday not found' });
      }
      res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
    });
  };
  
  
  
  
  const getHolidayById = (req, res) => {
    const { id } = req.params;
  
    const fetchSql = 'SELECT * FROM payroll_holiday WHERE payrl_holi_id = ?';
    
    db.pool.query(fetchSql, [id], (fetchErr, fetchData) => {
      if (fetchErr) {
        console.error('Database fetch error:', fetchErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (fetchData.length === 0) {
        return res.status(404).json({ success: false, message: 'Holiday not found' });
      }
  
      // Return the fetched data
      res.status(200).json({ success: true, data: fetchData[0] });
    });
  };
  
  
  const getHolidays = (req, res) => {
    const { searchItem } = req.query;
    
    let getHolidaysQuery;
    let queryParams = [];
  
    if (!searchItem || searchItem.trim() === "") {
      // Fetch all holidays if searchItem is not provided or is an empty string
      getHolidaysQuery = 'SELECT * FROM payroll_holiday';
    } else {
      // Fetch holidays based on search criteria
      getHolidaysQuery = `
        SELECT * FROM payroll_holiday 
        WHERE holiday_name LIKE ? 
        OR start_date LIKE ? 
        OR end_date LIKE ? 
        OR no_of_days LIKE ?`;
      
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery, searchQuery, searchQuery, searchQuery];
    }
  
    getHolidaysQuery+=` ORDER BY payrl_holi_id DESC`
    // Execute the query
    db.pool.query(getHolidaysQuery, queryParams, (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({ success: true, data: results });
    });
  };
  // leave type api 

  const createLeaveType = (req, res) => {
    const { leave_type, leave_days } = req.body;
    const sql = 'INSERT INTO leave_type (leave_type, leave_days) VALUES (?, ?)';
  
    db.pool.query(sql, [leave_type, leave_days], (err, result) => {
      if (err) {
        console.error("Database query error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json({ message: "Leave Type created successfully", leave_type_id: result.insertId });
    });
  };
  
  // Get All Leave Types
  const getLeaveTypes = (req, res) => {
    const { searchItem } = req.query;
  
    let getLeaveTypesQuery;
    let queryParams = [];
  
    if (!searchItem || searchItem.trim() === "") {
      // Fetch all leave types if searchItem is not provided or is an empty string
      getLeaveTypesQuery = 'SELECT * FROM leave_type';
    } else {
      // Fetch leave types based on search criteria for leave_type or leave_days
      getLeaveTypesQuery = `
        SELECT * FROM leave_type 
        WHERE leave_type LIKE ? 
        OR leave_days LIKE ?`;
      
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery, searchQuery];
    }
    getLeaveTypesQuery+=` ORDER BY leave_type_id DESC`
  
    // Execute the query
    db.pool.query(getLeaveTypesQuery, queryParams, (err, data) => {
      if (err) {
        console.error("Database query error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      res.json({ success: true, data });
    });
  };
  
  // Update Leave Type
  const updateLeaveType = (req, res) => {
    const { id } = req.params;
    const { leave_type, leave_days } = req.body;
  
    const fetchCurrentDataSql = 'SELECT * FROM leave_type WHERE leave_type_id = ?';
    db.pool.query(fetchCurrentDataSql, [id], (fetchErr, fetchData) => {
      if (fetchErr) {
        console.error('Database fetch error:', fetchErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (fetchData.length === 0) {
        return res.status(404).json({ success: false, message: 'Leave Type record not found' });
      }
  
      const currentData = fetchData[0];
      const updatedData = {
        leave_type: leave_type !== undefined ? leave_type : currentData.leave_type,
        leave_days: leave_days !== undefined ? leave_days : currentData.leave_days,
      };
  
      const updateSql = `
        UPDATE leave_type 
        SET leave_type = ?, leave_days = ? 
        WHERE leave_type_id = ?
      `;
  
      db.pool.query(updateSql, [updatedData.leave_type, updatedData.leave_days, id], (updateErr, result) => {
        if (updateErr) {
          console.error('Database update error:', updateErr);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        } else if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Leave Type record not found' });
        } else {
          return res.status(200).json({ success: true, message: 'Leave Type updated successfully' });
        }
      });
    });
  };
  
  
  const deleteLeaveType = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM leave_type WHERE leave_type_id = ?';
  
    db.pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Database query error: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Leave Type record not found' });
      }
      res.status(200).json({ message: "Leave Type deleted successfully" });
    });
  };
  // Get Leave Type by ID
  const getLeaveTypeById = (req, res) => {
    const { id } = req.params; // Extracting ID from request parameters
  
    const getLeaveTypeSql = 'SELECT * FROM leave_type WHERE leave_type_id = ?';
  
    // Execute the query
    db.pool.query(getLeaveTypeSql, [id], (err, data) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (data.length === 0) {
        return res.status(404).json({ success: false, message: 'Leave Type record not found' });
      }
  
      // Send the leave type data if found
      res.status(200).json({ success: true, data: data[0] });
    });
  };
  // leave application api
  const createLeaveApply = (req, res) => {
    const {
      emp_his_id, apply_strt_date, apply_end_date, apply_day,
        reason, approved_by, leave_type_id
    } = req.body;
console.log(emp_his_id)
    const sql = `
        INSERT INTO leave_apply 
        (employee_id, leave_type_id, apply_strt_date, apply_end_date, apply_day, reason, approved_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      emp_his_id, leave_type_id, apply_strt_date, apply_end_date, apply_day,
        reason, approved_by
    ];

    db.pool.query(sql, values, (err, data) => {
        if (err) {
            console.error('Error inserting leave application:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'Leave application created successfully', leave_apply_id: data.insertId });
    });
};
const getLeaveApplies = (req, res) => {
  const { searchItem } = req.query; // Get the search query from request query parameters

  console.log(searchItem)
  let sql = `
      SELECT la.employee_id, la.leave_appl_id, eh.first_name, eh.last_name, la.apply_strt_date, la.apply_end_date, 
             la.apply_day, la.leave_type_id, lt.leave_type, la.reason, eh.emp_his_id, la.approved_by, 
             u.firstname AS approved_by_firstname, u.lastname AS approved_by_lastname
      FROM leave_apply la 
      LEFT JOIN employee_history eh ON la.employee_id = eh.emp_his_id 
      LEFT JOIN leave_type lt ON la.leave_type_id = lt.leave_type_id
      LEFT JOIN user u ON u.id = la.approved_by
  `;

  let queryParams = [];

  // If searchItem is provided, modify the query to include a search filter
  if (searchItem && searchItem.trim() !== "") {
      sql += `
          WHERE eh.first_name LIKE ? 
          OR eh.last_name LIKE ? 
          OR CONCAT(eh.first_name, ' ', eh.last_name) LIKE ? 
          OR lt.leave_type LIKE ? 
          OR la.reason LIKE ?
          OR la.apply_strt_date LIKE ?
          OR la.apply_end_date LIKE ?
          OR  la.apply_day LIKE ?
      `;
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery,searchQuery,searchQuery,searchQuery];
  }

  // Execute the query
  db.pool.query(sql, queryParams, (err, data) => {
      if (err) {
          console.error('Error fetching leave applications:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Map the result to extract specific fields
      const result = data.map(emp => ({
          employee_id: emp.employee_id,
          leave_apply_id: emp.leave_appl_id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          apply_strt_date: emp.apply_strt_date,
          apply_end_date: emp.apply_end_date,
          apply_day: emp.apply_day,
          leave_type_id: emp.leave_type_id,
          leave_type: emp.leave_type,
          reason: emp.reason,
          employeehisid: emp.emp_his_id,
          approved_byid: emp.approved_by,
          approved_by_name: `${emp.approved_by_firstname} ${emp.approved_by_lastname}`,
      }));

      // Send the processed data back to the client
      res.status(200).json({ data: result, message: 'Leave applications fetched successfully' });
  });
};









const getLeaveApplyById = (req, res) => {
  const leave_apply_id = req.params.id;

  // SQL query with concatenation of first name and last name
  const sql = `
      SELECT la.employee_id, la.leave_appl_id, 
             CONCAT(eh.first_name, ' ', eh.last_name) AS employee_name,  -- Concatenate employee first and last name
             la.apply_strt_date, la.apply_end_date, 
             la.apply_day, la.leave_type_id, lt.leave_type, la.reason, 
             eh.emp_his_id, la.approved_by, 
             CONCAT(u.firstname, ' ', u.lastname) AS approved_by_name  -- Concatenate approver first and last name
      FROM leave_apply la 
      LEFT JOIN employee_history eh ON la.employee_id = eh.emp_his_id 
      LEFT JOIN leave_type lt ON la.leave_type_id = lt.leave_type_id
      LEFT JOIN user u ON u.id = la.approved_by 
      WHERE la.leave_appl_id = ?
  `;

  // Database query
  db.pool.query(sql, [leave_apply_id], (err, data) => {
      if (err) {
          console.error('Error fetching leave application by ID:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      console.log("data", data);

      // Respond with the result
      res.status(200).json({ data: data });
  });
};


const deleteLeaveApply = (req, res) => {
    const leave_apply_id = req.params.id;

    const sql = `DELETE FROM leave_apply WHERE leave_appl_id = ?`;

    db.pool.query(sql, [leave_apply_id], (err, result) => {
        if (err) {
            console.error('Error deleting leave application:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        res.status(200).json({ message: 'Leave application deleted successfully' });
    });
};
const updateLeaveApply = (req, res) => {
  const leave_apply_id = req.params.id;
  const {
    emp_his_id, leave_type_id, apply_strt_date, apply_end_date, apply_day,
      reason, approved_by
  } = req.body;

  const sql = `
      UPDATE leave_apply
      SET employee_id = ?, leave_type_id = ?, apply_strt_date = ?, apply_end_date = ?, apply_day = ?,
          reason = ?, approved_by = ?
      WHERE leave_appl_id = ?
  `;

  const values = [
    emp_his_id, leave_type_id, apply_strt_date, apply_end_date, apply_day,
      reason, approved_by,  leave_apply_id
  ];

  db.pool.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error updating leave application:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Leave application not found' });
      }

      res.status(200).json({ message: 'Leave application updated successfully' });
  });
};
  
  
  module.exports = {
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    getHolidayById,
    createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType,
  getLeaveTypeById,
  createLeaveApply,
  getLeaveApplies,
  updateLeaveApply,
  deleteLeaveApply,
  getLeaveApplyById
  
  };