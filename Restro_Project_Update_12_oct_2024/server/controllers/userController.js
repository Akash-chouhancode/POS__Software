const db = require("../utils/db");
const axios =require("axios")
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer=require("nodemailer")
const bcrypt = require('bcryptjs');
const saltRounds = 10; // You can increase this value for more security

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
const addUser = async (req, res) => {
    try {
      const body = {};
      for (let key in req.body) {
        body[key.trim()] = req.body[key];
      }
  
      const { firstname, lastname, about, email, password, status, is_admin } =
        body;
  
      if (
        !firstname ||
        !lastname ||
        !email ||
        !password ||
        status === undefined
      ) {
        return res.status(400).send({ error: "Missing required fields" });
      }
  
      const checkEmailQuery =
        "SELECT COUNT (*) AS count FROM user WHERE email = ?";
      db.pool.query(checkEmailQuery, [email], async (err, result) => {
        if (err) {
          return res
            .status(500)
            .send({ error: "Database error while checking email" });
        }
  
        const count = result[0].count;
        if (count > 0) {
          return res
            .status(409)
            .send({ error: "User with this email already exists" });
        }
  
        const image = req.file ? req.file.filename : null;
        const last_login = new Date().toISOString();
        const last_logout = null;
        // const isAdmin =
          // is_admin === true || is_admin === "true" || is_admin === 1 ? 1 : 0;
  
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
  
        const insertUserQuery = `INSERT INTO user (firstname, lastname, about, email, password, image, last_login, last_logout, status, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
          firstname,
          lastname,
          about,
          email,
          hashedPassword, // Save the hashed password
          image,
          last_login,
          last_logout,
          status,
          is_admin,
        ];
  
        db.pool.query(insertUserQuery, values, (err, data) => {
          if (err) {
            res
              .status(500)
              .send({ error: "Error while adding user", details: err.message });
          } else {
            res.status(200).send({ message: "User added successfully", data });
          }
        });
      });
    } catch (err) {
      res
        .status(500)
        .send({ error: "Internal server error", details: err.message });
    }
  };
  const getUsers = async (req, res) => {
    const { searchItem } = req.query; // Assuming searchItem comes from query parameters
    let sql = "SELECT * FROM user WHERE 1=1";
  
    if (searchItem) {
      sql += ` AND (firstname LIKE ? 
                   OR lastname LIKE ? 
                   OR about LIKE ? 
                   OR email LIKE ? 
                   OR last_login LIKE ? 
                   OR last_logout LIKE ? 
                   OR ip_address LIKE ? 
                   OR status=1 AND 'active' LIKE ? 
                     OR status=0 AND 'inactive' LIKE ? 
  
                   OR CONCAT(firstname, ' ', lastname) LIKE ?)`;
    }
  
    const searchValue = `%${searchItem}%`; // Use wildcard for partial match
    const values = [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    ];
    sql+=` ORDER BY id DESC`
  
    db.pool.query(sql, searchItem ? values : [], (err, data) => {
      if (err) {
        return res
          .status(500)
          .send({ error: "Unable to fetch data", details: err });
      }
      return res.status(200).send({ data: data });
    });
  };
  const deleteUser = async (req, res) => {
    const { id } = req.params;
  
    const sqlFetchImage = `SELECT image FROM user WHERE id = ?`;
    db.pool.query(sqlFetchImage, [id], (err, result) => {
      if (err) {
        console.error("Error fetching image:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: err });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const imageFilename = result[0].image;
  
      const sqlDeleteUser = `DELETE FROM user WHERE id = ?`;
      db.pool.query(sqlDeleteUser, [id], (err, result) => {
        if (err) {
          console.error("Error deleting user:", err);
          return res
            .status(500)
            .json({ error: "Internal Server Error", details: err });
        }
  
        if (imageFilename) {
          const imagePath = path.join(__dirname, "../asset/user", imageFilename);
          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting image file:", unlinkErr);
                return res
                  .status(500)
                  .json({ error: "Internal Server Error", details: unlinkErr });
              }
              return res.json({
                message: "User and image file deleted successfully",
              });
            });
          } else {
            return res.json({
              message: "User deleted successfully, image file not found",
            });
          }
        } else {
          return res.json({
            message: "User deleted successfully, no associated image",
          });
        }
      });
    });
  };



  
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;  // Get user ID from the URL parameters

    const getUserQuery = 'SELECT * FROM user WHERE id = ?';

    db.pool.query(getUserQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).send({ error: 'Error while fetching user', details: err.message });
      }

      if (result.length === 0) {
        return res.status(404).send({ error: 'User not found' });
      }

      // Map the result to get only the necessary fields
      const user = {
        firstname: result[0].firstname,
        lastname: result[0].lastname,
        email: result[0].email,
        about: result[0].about,
        image: result[0].image,
        status: result[0].status,
        is_admin: result[0].is_admin,
      };

      res.status(200).send({ message: 'User retrieved successfully', data: user });
    });
  } catch (err) {
    res.status(500).send({ error: 'Internal server error', details: err.message });
  }
};



  
const logoutUser = async (req, res) => {
  const { id } = req.params;
  
  const sql = `UPDATE user SET last_logout = NOW() WHERE id = ?`;
  db.pool.query(sql, [id], (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Logout successful");
    }
  });
};
  

  const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
  
    const sql = `SELECT * FROM user WHERE email = ?`;
    db.pool.query(sql, [email], async (err, data) => {
      if (err) {
        return res.status(500).send({ error: 'Internal server error', details: err.message });
      }
  
      if (data.length === 0) {
        return res.status(401).send({ message: 'Invalid email' });
      }
  
      const user = data[0];
  
  
      if (user.is_admin === 1) {
        // Compare the hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
          // Update the last login time
          
          const updateSql = 'UPDATE user SET last_login = NOW() WHERE id = ?';
          db.pool.query(updateSql, [ user.id], (updateErr) => {
            if (updateErr) {
              return res.status(500).send({ error: 'Failed to update last login time', details: updateErr.message });
            }
  
            const payload = {
              id: user.id,
              email: user.email,
            };
  
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3600s' });
  
            // Save the token in the database
            const updateTokenSql = `UPDATE user SET authtoken = ? WHERE id = ?`;
            db.pool.query(updateTokenSql, [token, user.id], (tokenErr) => {
              if (tokenErr) {
                return res.status(500).send({ error: 'Failed to update token', details: tokenErr.message });
              }
  
              // Admin login response without role and permissions
              return res.status(200).send({
                message: 'Admin login successful',
                token,
                userId: user.id,
                username: user.firstname + " " + user.lastname,
                isAdmin: true,  
              });
            });
          });
        } else {
          return res.status(401).send({ message: 'Invalid email or password' });
        }
      } else {
        // Non-admin users proceed with role and permission checks
        const isPasswordMatch = await bcrypt.compare(password, user.password);
      
        if (isPasswordMatch) {
          // Update the last login time
          const last_login = new Date().toISOString();
          const updateSql = `UPDATE user SET last_login = ? WHERE id = ?`;
          db.pool.query(updateSql, [last_login, user.id], (updateErr) => {
            if (updateErr) {
              return res.status(500).send({ error: 'Failed to update last login time', details: updateErr.message });
            }
  
            const payload = {
              id: user.id,
              email: user.email,
            };
  
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '60m' });
  
            // Fetch role_id from sec_user_access_tbl based on user.id
            const roleQuery = `SELECT fk_role_id FROM sec_user_access_tbl WHERE fk_user_id = ?`;
            db.pool.query(roleQuery, [user.id], (roleErr, roleData) => {
              if (roleErr) {
                return res.status(500).send({ error: 'Error fetching user role', details: roleErr.message });
              }
  
              if (roleData.length === 0) {
                return res.status(403).send({ error: 'Role not assigned to the user' });
              }
  
              const roleId = roleData[0].fk_role_id;
  
              // Fetch permissions related to the role
              const permissionQuery = `SELECT * FROM sec_role_permission WHERE role_id = ?`;
              db.pool.query(permissionQuery, [roleId], (permErr, permData) => {
                if (permErr) {
                  return res.status(500).send({ error: 'Error fetching role permissions', details: permErr.message });
                }
  
                // Save the token in the database
                const updateTokenSql = `UPDATE user SET authtoken = ? WHERE id = ?`;
                db.pool.query(updateTokenSql, [token, user.id], (tokenErr) => {
                  if (tokenErr) {
                    return res.status(500).send({ error: 'Failed to update token', details: tokenErr.message });
                  }
  
                  // Send response with user details, roleId, permissions, and token
                  return res.status(200).send({
                    message: 'Login successful',
                    token,
                    userId: user.id,
                    username: user.firstname + " " + user.lastname,
                    roleId,
                    permData,
                    isAdmin:false
                  });
                });
              });
            });
          });
        } else {
          return res.status(401).send({ message: 'Invalid email or password' });
        }
      }
    });
  };



 
  const updateUser = async (req, res) => {
    const { id } = req.params;
    const {
      firstname,
      lastname,
      about,
      email,
      password,
      status,
      is_admin,
    } = req.body;
  
    if (!password) {
      return res.status(400).send({ error: 'Password is Mandatory' });
    }
  
    const fetchCurrentDataSql = "SELECT * FROM user WHERE id = ?";
    db.pool.query(fetchCurrentDataSql, [id], async (fetchErr, fetchData) => {
      if (fetchErr) {
        console.error("Database fetch error: ", fetchErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      if (fetchData.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const currentData = fetchData[0];
  
      let newImageFilename = currentData.image;
      if (req.file) {
        newImageFilename = req.file.filename;
  
        if (currentData.image) { // Check if image exists
          const oldFilePath = path.join(__dirname, "../assets/users", currentData.image);
          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting old file: ", unlinkErr);
              }
            });
          }
        }
      }
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const sql = `UPDATE user 
                  SET firstname = ?, lastname = ?, about = ?, email = ?, status=?, is_admin=?,
                      password = COALESCE(?, password), 
                      image = ?
                  WHERE id = ?`;
  
      const values = [
        firstname || currentData.firstname,
        lastname || currentData.lastname,
        about || currentData.about,
        email || currentData.email,
        status || currentData.status,
        is_admin || currentData.is_admin,
        hashedPassword,
        newImageFilename,
        id
      ];
  
      db.pool.query(sql, values, (err, data) => {
        if (err) {
          console.error("Database query error: ", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        return res.json({ message: "User data updated successfully" });
      });
    });
  };


  const getAllCountry = async (req, res) => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      
      // Map the country data to include an id and the country name
      const countryData = response.data.map((country, index) => ({
        countryName: country.name.common,
        id: index + 1
      }));
      
      res.status(200).json({ data: countryData });
    } catch (error) {
      console.error('Error fetching country names:', error);
      res.status(500).json({ error: 'Failed to retrieve country names' });
    }
  };

  const checkIncheckOut = async (req, res) => {
    try {
      // Corrected SQL query with proper CONCAT syntax
      const query = `SELECT id, CONCAT(firstname, ' ', lastname) AS username, last_login, last_logout FROM user`;
      
      // Execute the query (assuming dbQuery returns a promise)
      const result = await dbQuery(query);
      
      if (result.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }
  
      // Function to format date and time
      const formatDateTime = (dateTime) => {
        if (!dateTime) return { date: null, time: null }; // Handle null values gracefully
        const dateObj = new Date(dateTime);
        if (isNaN(dateObj)) {
          throw new Error(`Invalid date value: ${dateTime}`);
        }
        const date = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        const time = dateObj.toTimeString().split(' ')[0]; // Extract HH:MM:SS
        return { date, time };
      };
  
      // Map and format data
      const dataMap = result.map((data) => {
        const loginDateTime = formatDateTime(data.last_login);
        const logoutDateTime = formatDateTime(data.last_logout);
  
        return {
          userid: data.id,
          username: data.username,
          last_login_date: loginDateTime.date,
          last_login_time: loginDateTime.time,
          last_logout_date: logoutDateTime.date,
          last_logout_time: logoutDateTime.time
        };
      });
  
      res.status(200).json({ data: dataMap });
    } catch (err) {
      res.status(500).json({ message: err.message, success: false });
    }
  };


  const ForgetPasswordController = async (req, res) => {
    const { email } = req.body;
    console.log("email",email)

    try {
        // Fetch user from the database
        const rows = await dbQuery('SELECT * FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = rows[0];
        const id = user.id;

        // Generate a JWT token
        const token = jwt.sign(
            { id: id },
            process.env.JWT_SECRET || 'uhkjhkh', // Replace 'uhkjhkh' with a strong secret or use an environment variable
            { expiresIn: '1h' }
        );

        // Configure the email transporter
        const transporter = nodemailer.createTransport({
          host: "mail.theprojectxyz.xyz",
          port: 465, // or 587
          secure: true, 
          auth: {
            user: "akashlakshkar@theprojectxyz.xyz",
            pass: "jBkPx@+Wjj^A",
          },
        });
       
        console.log("userid and token",id,token)
        
        // Email options
        const mailOptions = {
            from: 'support@krayon.upgradu.in',
            to: user.email, // Recipient address
            subject: 'Password Reset Request', // Subject line
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href="https://krayon.theprojectxyz.xyz/frontend/resetpassword/${id}/${token}">Reset Password</a></p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Password reset link sent to email' });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const resetPasswordController = async (req, res) => {
  const { id, token } = req.params; // Extract user ID and token from request parameters
  const { password } = req.body; // Extract new password from request body

  try {
      console.log("Reset Password Initiated");
      console.log("User ID and Token:", id, token);

      // Fetch user by ID
      const user = await dbQuery("SELECT * FROM user WHERE id = ?", [id]);
      if (user.length === 0) {
          return res.status(404).json({ error: "User not found." });
      }

      console.log("User Found:", user);

      // Hash the password using bcrypt before storing it (recommended for security)
      const saltRounds = 10; // Number of salt rounds
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update user's password in the database
      await dbQuery("UPDATE user SET password = ? WHERE id = ?", [hashedPassword, id]);

      res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
      console.error("Error in Reset Password Controller:", error);
      res.status(500).json({ error: "An error occurred while resetting the password." });
  }
};

  module.exports={
    addUser,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    loginUser,
    logoutUser,
    getAllCountry,
    checkIncheckOut,
    ForgetPasswordController,
    resetPasswordController
  }