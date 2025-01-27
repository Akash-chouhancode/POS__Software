const db = require("../utils/db");

const getAllRoles = async (req, res) => {
  try {
    const { searchItem } = req.query; // Retrieve the search term from query parameters
    console.log(searchItem);

    let getRolesQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
      // Fetch all roles if searchItem is not provided or is an empty string
      getRolesQuery = `SELECT * FROM sec_role_tbl `;
    } else {
      // Fetch roles based on search criteria
      getRolesQuery = `SELECT * FROM sec_role_tbl WHERE role_name LIKE ? `;
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery];
    }


    getRolesQuery+=` ORDER BY role_id DESC`;
    // Execute the query
    db.pool.query(getRolesQuery, queryParams, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching roles",
        });
      }

      res.status(200).json({
        success: true,
        data: results,
        message: "Roles fetched successfully",
      });
    });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred" });
  }
};

const deleteRolePermission = async (req, res) => {
  try {
    const { role_id } = req.params; // Role ID from request parameters

    // Check if the role exists
    const results = await dbQuery("SELECT * FROM sec_role_tbl WHERE role_id = ?", [role_id]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // Delete associated permissions from sec_role_permission
    await dbQuery("DELETE FROM sec_role_permission WHERE role_id = ?", [role_id]);

    // Delete the role from sec_role_tbl
    await dbQuery("DELETE FROM sec_role_tbl WHERE role_id = ?", [role_id]);
    await dbQuery("DELETE FROM sec_user_access_tbl WHERE fk_role_id = ?", [role_id]);

    // Send success response
    res.status(200).json({
      success: true,
      message: "Role and permissions deleted successfully"
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the role and permissions"
    });
  }
};
// get all menu type items

const getAllMenuItems = async (req, res) => {
  try {
    const { searchItem } = req.query; // Assuming "seachItem" is meant to be "searchItem"

    let getMenuItemsQuery;
    let queryParams = [];

    if (!searchItem || searchItem.trim() === "") {
      // Fetch all menu items if searchItem is not provided or is an empty string
      getMenuItemsQuery = "SELECT * FROM sec_menu_item";
    } else {
      // Fetch menu items based on search criteria
      getMenuItemsQuery = "SELECT * FROM sec_menu_item WHERE menu_title LIKE ?";
      const searchQuery = `%${searchItem}%`;
      queryParams = [searchQuery];
    }

    // Execute the first query to get the menu items
    db.pool.query(getMenuItemsQuery, queryParams, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while fetching menu items",
        });
      }

      if (results.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No menu items found",
        });
      }

      const parentMenuIds = results
        .map((item) => item.parent_menu)
        .filter(Boolean); // Collect non-null parent_menu IDs

      if (parentMenuIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: results,
          message: "Menu items fetched successfully without parent menus",
        });
      }

      // Query to fetch parent menu titles based on parent_menu IDs
      const sql2 =
        "SELECT menu_id, menu_title FROM sec_menu_item WHERE menu_id IN (?)";

      db.pool.query(sql2, [parentMenuIds], (err, menuTitles) => {
        if (err) {
          console.error("Second database query error:", err);
          return res.status(500).json({
            success: false,
            message: "An error occurred while fetching parent menu titles",
          });
        }

        // Create a map of menu_id to menu_title for quick lookup
        const menuTitleMap = {};
        menuTitles.forEach((item) => {
          menuTitleMap[item.menu_id] = item.menu_title;
        });

        // Map parent menu titles to the original results
        const itemsWithTitles = results.map((item) => ({
          ...item,
          parent_menu_title: menuTitleMap[item.parent_menu] || 0,
        }));

        // Send the response with the mapped results
        res.status(200).json({
          success: true,
          data: itemsWithTitles,
          message: "Menu items fetched successfully",
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};


const getAllUserAccesses = (req, res) => {
  const { searchItem } = req.query;

  // Base SQL query
  let sql = `
    SELECT 
      sec_user_access_tbl.role_acc_id, 
      sec_user_access_tbl.fk_role_id, 
      sec_user_access_tbl.fk_user_id, 
      user.firstname, 
      user.lastname, 
      sec_role_tbl.role_name
    FROM 
      sec_user_access_tbl
    LEFT JOIN 
      user ON sec_user_access_tbl.fk_user_id = user.id
    LEFT JOIN 
      sec_role_tbl ON sec_user_access_tbl.fk_role_id = sec_role_tbl.role_id
    WHERE 
      user.is_admin != 1
  `;

  // Add search condition if searchItem is provided
  if (searchItem) {
    sql += ` AND (CONCAT(user.firstname, ' ', user.lastname) LIKE ? OR sec_role_tbl.role_name LIKE ?) `;
  }

  // Append ORDER BY clause
  sql += ` ORDER BY sec_user_access_tbl.role_acc_id DESC`;

  // Execute the query with the searchItem as a parameter if it exists
  const queryParams = searchItem ? [`%${searchItem}%`, `%${searchItem}%`] : [];
  
  db.pool.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ success: false, message: "An error occurred" });
    } else {
      res.status(200).json({ success: true, data: results });
    }
  });
};



const createUserAccess = (req, res) => {
  const { fk_role_ids, fk_user_id } = req.body; // assuming fk_role_ids is an array
  if (!Array.isArray(fk_role_ids) || fk_role_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Role IDs should be a non-empty array",
    });
  }

  // Constructing the query dynamically based on the number of roles
  let values = fk_role_ids.map((role_id) => [role_id, fk_user_id]);
  const sql =
    "INSERT INTO sec_user_access_tbl (fk_role_id, fk_user_id) VALUES ?";

  db.pool.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ success: false, message: "An error occurred" });
    } else {
      res.status(201).json({
        success: true,
        message: "User access created successfully",
        affectedRows: result.affectedRows, // return the number of rows inserted
      });
    }
  });
};
const deleteUserAccess = (req, res) => {
  const { role_acc_id } = req.params;
  const sql = "DELETE FROM sec_user_access_tbl WHERE role_acc_id = ?";
  db.pool.query(sql, [role_acc_id], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ success: false, message: "An error occurred" });
    } else if (result.affectedRows === 0) {
      res
        .status(404)
        .json({ success: false, message: "User access record not found" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "User access deleted successfully" });
    }
  });
};

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
const editAccessRole = async (req, res) => {
  try {
    const fk_user_id = req.params.id;

    const accessInfoQuery = `
    SELECT srt.role_name, srt.role_id
 
    FROM sec_user_access_tbl suat 
    LEFT JOIN sec_role_tbl srt ON srt.role_id = suat.fk_role_id 

    WHERE suat.fk_user_id = ?
  `;

    const accessInfo = await dbQuery(accessInfoQuery, [fk_user_id]);
    const username =
      "SELECT id, firstname, lastname FROM user WHERE id=? AND is_admin != 1";
    const userinfo = await dbQuery(username, fk_user_id);

    console.log(accessInfo);
    // If accessInfo is not found, return 404
    if (!accessInfo || accessInfo.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No role access info found for the given ID",
        });
    }

    // Construct response data
    const data = {
      // role: roles,
      // user: users,
      accessInfo,
      userinfo, // Return the first result
    };

    // Send the response
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Database query error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching role access information.",
      });
  }
};

const updateUserAccess = async (req, res) => {
  const id = req.params.id;
  const { fk_role_ids, fk_user_id } = req.body; // assuming fk_role_ids is an array
console.log("user id",fk_user_id)
  try {
    // First, delete the existing roles for the user
    const deleteQuery = 'DELETE FROM sec_user_access_tbl WHERE fk_user_id = ?';
    await db.pool.promise().query(deleteQuery, [id]);

    // Insert the new roles for the user
    let values = fk_role_ids.map(role_id => [role_id, fk_user_id]);
    const insertQuery = 'INSERT INTO sec_user_access_tbl (fk_role_id, fk_user_id) VALUES ?';
    await db.pool.promise().query(insertQuery, [values]);

    res.status(200).json({ success: true, message: 'User access updated successfully' });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating user access' });
  }
};

const createRolePermission = async (req, res) => {
  try {
    const { role_name, role_description, permissions } = req.body; // permissions is an array of objects
    const create_by = req.id; // Replace with session user ID
    console.log(req.id);
    const date_time = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Insert role into the sec_role_tbl table
    const roleInsertResult = await dbQuery(
      "INSERT INTO sec_role_tbl (role_name, role_description, create_by, date_time) VALUES (?, ?, ?, ?)",
      [role_name, role_description, create_by, date_time]
    );
    const role_id = roleInsertResult.insertId;

    // Prepare valuesArray for batch insert
    let valuesArray = [];

    // Loop through the permissions array received from the frontend
    permissions.forEach((item) => {
      const module_name = item.module_name; // Using 'module' field for module_name from frontend

      // Add the permission details from each module
      valuesArray.push([
        role_id, // Role ID
        module_name, // Module Name from the frontend
        item.can_access || 0, // Can access (read) permission
        item.can_create || 0, // Can create permission
        item.can_edit || 0, // Can edit permission
        item.can_delete || 0, // Can delete permission
        date_time, // Created date
        create_by, // Created by (user id from session)
      ]);
    });

    // Prepare the INSERT query with placeholders for batch insert
    const insertPermissionsQuery = `
      INSERT INTO sec_role_permission 
      (role_id, module_name, can_access, can_create, can_edit, can_delete, createdate, createby) 
      VALUES ?`;

    // Execute the query with valuesArray
    await dbQuery(insertPermissionsQuery, [valuesArray]);

    // Send success response
    res.status(200).json({
      success: true,
      message: "Role and permissions added successfully",
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};



// edit role
const getRolePermissionById = async (req, res) => {
  try {
    const role_id = req.params.role_id;

    // Get role information
    const roleQueryResult = await dbQuery(
      "SELECT * FROM sec_role_tbl WHERE role_id = ?",
      [role_id]
    );

    if (roleQueryResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const role = roleQueryResult[0];

    // Get associated permissions
    const permissionsQueryResult = await dbQuery(
      "SELECT * FROM sec_role_permission WHERE role_id = ?",
      [role_id]
    );

    // Send success response
    res.status(200).json({
      success: true,
      data: { role, permissionsQueryResult },
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};
//update

const updateRolePermission = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { role_name, role_description, permissions } = req.body; // permissions is an array of objects
    const createby = req.id;  
    const date_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Fetch current role data
    const results = await dbQuery("SELECT * FROM sec_role_tbl WHERE role_id = ?", [role_id]);
    const currentData = results[0];
    
    // Fallback to current values if fields are not provided
    const updateData = {
      role_name: role_name !== undefined ? role_name : currentData.role_name,
      role_description: role_description !== undefined ? role_description : currentData.role_description,
      create_by: createby !== undefined ? createby : currentData.create_by,
      date_time,
    };
// console.log(permissions)
    // Update role in the sec_role_tbl table
    await dbQuery(
      "UPDATE sec_role_tbl SET role_name = ?, role_description = ?, create_by = ?, date_time = ? WHERE role_id = ?",
      [updateData.role_name, updateData.role_description, updateData.create_by, updateData.date_time, role_id]
    );

    // Delete existing permissions for the role from sec_role_permission
    await dbQuery("DELETE FROM sec_role_permission WHERE role_id = ?", [role_id]);

    // Prepare valuesArray for batch insert
    let valuesArray = [];

    // Loop through the permissions array received from the frontend
    permissions.forEach(item => {
      const module_name = item.module_name; // Using 'module' field for module_name from frontend

      // Add the permission details from each module
      valuesArray.push([
        role_id,                          // Role ID
        module_name,                      // Module Name from the frontend
        item.can_access || 0,             // Can access (read) permission
        item.can_create || 0,             // Can create permission
        item.can_edit || 0,               // Can edit permission
        item.can_delete || 0,             // Can delete permission
        date_time,                        // Updated date
        createby                          // Updated by (user id from session)
      ]);
    });

    // Prepare the INSERT query with placeholders for batch insert
    const insertPermissionsQuery = `
      INSERT INTO sec_role_permission 
      (role_id, module_name, can_access, can_create, can_edit, can_delete, createdate, createby) 
      VALUES ?`;

    // Execute the query with valuesArray
    await dbQuery(insertPermissionsQuery, [valuesArray]);

    // Send success response
    res.status(200).json({
      success: true,
      message: "Role and permissions updated successfully"
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the role and permissions"
    });
  }
};
module.exports = {
  getAllRoles,
  deleteRolePermission,
  getAllMenuItems,
  getAllUserAccesses,
  deleteUserAccess,
  createUserAccess,
  editAccessRole,
  updateUserAccess,
  createRolePermission,
  getRolePermissionById,
  updateRolePermission
};
