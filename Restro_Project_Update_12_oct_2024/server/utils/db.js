require("dotenv").config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  // port: process.env.DB_PORT || 3306, // Default MySQL port
  port:3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Limit the number of connections in the pool
  queueLimit: 0, // Unlimited queueing of connection requests
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting to the database...');
  } else {
    throw err; // Re-throw other errors
  }
});

// Function to get a connection from the pool
const getConnection = async () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

module.exports = { pool, getConnection };
