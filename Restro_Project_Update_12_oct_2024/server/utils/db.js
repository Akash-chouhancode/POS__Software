require("dotenv").config();
// const mysql = require("mysql");
// const mysql = require('mysql2'); // Use mysql2 for better support
// // const db = mysql.createConnection({
// //   host: process.env.DB_HOST,
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASSWORD,
// //   database: process.env.DB_NAME,
// // });

// // db.connect((err) => {
// //   if (err) {
// //     console.error("Error connecting to the database:", err.stack);
// //     return;
// //   }
// //   console.log("Connected to the database as id " + db.threadId);
// // });

// // module.exports = db;

// // const handleDisconnect = () => {
// //   const connection = mysql.createConnection({
// //     host: process.env.DB_HOST,
// //     port: process.env.DB_PORT,
// //     user: process.env.DB_USER,
// //     password: process.env.DB_PASSWORD,
// //     database: process.env.DB_NAME,
// //   });

// //   connection.connect((err) => {
// //     if (err) {
// //       console.error("Error connecting to database:", err);
// //       setTimeout(handleDisconnect, 2000); // Try to reconnect after delay
// //     }
// //   });

// //   connection.on("error", (err) => {
// //     console.error("Database error:", err);
// //     if (err.code === "PROTOCOL_CONNECTION_LOST") {
// //       handleDisconnect(); // Reconnect if connection is lost
// //     } else {
// //       throw err; // Other fatal errors
// //     }
// //   });

// //   return connection;
// // };

// // const connection = handleDisconnect();

// // module.exports = connection;

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT || 3306, // Default MySQL port
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 5, // Limit the number of connections in the pool
//   queueLimit: 0, // Unlimited queueing of connection requests
// });

// pool.on('connection', (connection) => {  
//   exex('npm start');
//   console.log('New database connection established:', connection.threadId);
// });

// pool.on('acquire', (connection) => {
//   console.log('Connection %d acquired', connection.threadId);
// });

// pool.on('release', (connection) => {
//   console.log('Connection %d released', connection.threadId);
// });

// pool.on('error', (err) => {
//   exec('lsof -i :4502');
//   exex('npm start');
//   console.error('Database pool error:', err);
//   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//       console.log('Database connection was closed.');
//   } else if (err.code === 'ER_CON_COUNT_ERROR') {
//       console.log('Database has too many connections.');
//   } else if (err.code === 'ECONNREFUSED') {
//       console.log('Database connection was refused.');
//   }
// });

// // Function to get a connection from the pool
// const getConnection = async () => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) {
//         console.error('Error getting connection from pool:', err);
//         console.log("Connected to the database as id " + db.threadId);
//         reject(err);
//       } else {
//         resolve(connection);
//       }
//     });
//   });
// };

// module.exports = { pool, getConnection };

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
