const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require("../utils/db");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


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

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).send({ message: 'No token provided' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    // console.log("v",verified.id,"s",req.id)

    if (req.id = verified.id) {
      next();
    } else {
      return res.status(401).send({ message: 'Unauthorized' });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'Token expired' });
    }
    return res.status(401).send({ message: 'Invalid token' });
  }
};



// Middleware to verify if the user is an admin
// const verifyAdmin = async (req, res, next) => {
//   try {
//     const id = req.id;  
    
   
//     const result = await dbQuery("SELECT * FROM user WHERE id = ?", [id]);


//     if (result.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the user is an admin
//     const userIsAdmin = result[0].is_admin;
//     console.log("si",userIsAdmin)
//     if (userIsAdmin === 1) {
//       next();  // If user is admin, proceed to the next middleware or route handler
//     } else {
//       return res.status(403).json({ message: "Access denied. Admins only have access." });
//     }
//   } catch (err) {
//     console.error("Error verifying admin:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


module.exports = verifyToken