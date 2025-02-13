// import React from 'react';
// import { useEffect, useState, createContext } from "react";
// import { jwtDecode } from "jwt-decode";
// import { toast } from 'react-toastify';
// import axios from 'axios';
// const AuthContext= createContext()
// const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [permissions, setPermissions] = useState([]);
//   const [userId, setUserId] = useState(localStorage.getItem("userId"));
//   const [username, setUsername] = useState(localStorage.getItem("username"));
//   const [isAdmin, setIsAdmin] = useState(JSON.parse(localStorage.getItem("isAdmin")) || false);
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//   if (isAdmin) {
//     localStorage.setItem("permissions", JSON.stringify("admin")); // Or your default admin structure
//   } else {
//     const userPermissions = ["read", "write"]; // Example permissions
//     localStorage.setItem("permissions", JSON.stringify(userPermissions));
//   }
//   useEffect(() => {
//     const storedPermissions = localStorage.getItem("permissions");
  
//     // Check if storedPermissions is a valid JSON string
//     if (storedPermissions && storedPermissions !== "undefined") {
//       try {
//         setPermissions(JSON.parse(storedPermissions)); // Parse and set permissions
//       } catch (error) {
//         console.error("Error parsing permissions from localStorage:", error);
//         setPermissions([]); // Fallback to empty array if parsing fails
//       }
//     } else {
//       setPermissions([]); // Fallback for no permissions or invalid values
//     }
//   }, []);
  
//   const storeToken = (serverToken, permData,username,userId,isAdmin) => {
//     try{
//       const decodedToken = jwtDecode(serverToken);
//       console.log("Decoded token:", decodedToken);
//       const expirationTime = decodedToken.exp * 1000;
//       const currentTime = Date.now();
//     localStorage.setItem("token", serverToken);
//     localStorage.setItem("permissions", JSON.stringify(permData)); // Store permissions in local storage
//     localStorage.setItem("userId", userId);
//     localStorage.setItem("username", username);
//     localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
//     setToken(serverToken);
//     setPermissions(permData);
//     setUserId(userId);
//     setUsername(username);
//     setIsAdmin(isAdmin);
   
//     const timeoutDuration = expirationTime - currentTime;
//       console.log("time",timeoutDuration)
//       if (timeoutDuration > 0) {
//         setTimeout(() => {
//           logoutUser();
//         }, timeoutDuration);
//       } else {
//         logoutUser();
//       }

//     }
 
//      catch (err) {
//       console.error("Error decoding token:", err);
//       logoutUser();
//     }

//   };


//   const logoutUser = async () => {
//     // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//     try {
//       // Ensure the user ID i
//       console.log("user",userId)

//       await axios.post(`${API_BASE_URL}/logout/${userId}`);
//       // Clear user-related states and local storage
//       setToken("");
//       setPermissions([]);
//       setUserId(null);
//       setUsername(null);
//       setIsAdmin(false);

//       localStorage.removeItem("token");
//       localStorage.removeItem("permissions");
//       localStorage.removeItem("userId");
//       localStorage.removeItem("username");
//       localStorage.removeItem("isAdmin");

//       toast.info("Logout successful!");
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Logout failed, please try again!");
//     }
//   };
//   let isLogin = token && (() => {
//     try {
//       const decodedToken = jwtDecode(token);
//       return decodedToken.exp * 1000 > Date.now();
//     } catch (err) {
//       return false;
//     }
//   })();


//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) {
//       const decodedToken = jwtDecode(storedToken);
//       const currentTime = Date.now();
//       if (decodedToken.exp * 1000 > currentTime) {
//         setToken(storedToken);
//         // setPermissions(JSON.parse(localStorage.getItem("permissions") ||  setPermissions([])));
//         let storedPermissions;
//         try {
//           storedPermissions = JSON.parse(localStorage.getItem("permissions")) || [];
//         } catch (err) {
//           console.error("Error parsing permissions:", err);
//           storedPermissions = []; // Fallback to an empty array
//         }
//         setPermissions(storedPermissions);
//         setUserId(localStorage.getItem("userId"));
//         setUsername(localStorage.getItem("username"));
//         setIsAdmin(JSON.parse(localStorage.getItem("isAdmin")));
//       } else {
//         logoutUser();
//       }
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ token, permissions, userId, isAdmin,username, storeToken, logoutUser, isLogin}}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export { AuthContext, AuthProvider };


import React, { useEffect, useState, createContext, useMemo, useCallback } from "react";
// import jwtDecode from "jwt-decode"; // Ensure correct import
 import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Initialize state from localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [permissions, setPermissions] = useState(() => {
    try {
      const storedPermissions = localStorage.getItem("permissions");
      const isAdmin = localStorage.getItem("isAdmin") === "true"; // Check admin flag
      
      if (isAdmin) {
        return "admin"; // Return a special value or full-access permissions for admin
      }
  
      return storedPermissions ? JSON.parse(storedPermissions) : [];
    } catch (error) {
      console.error("Failed to parse permissions:", error);
      return []; // Fallback to an empty array
    }
  });
  
  
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const [isAdmin, setIsAdmin] = useState(() =>
    JSON.parse(localStorage.getItem("isAdmin") || "false")
  );
  const clearAuthData = useCallback(() => {
    setToken(null);
    setPermissions([]);
    setUserId(null);
    setUsername(null);
    setIsAdmin(false);
    localStorage.clear();
  }, []);
  // Derived state: isLogin
  const isLogin = useMemo(() => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, [token]);

  // Logout user
  const logoutUser = useCallback(async () => {
    try {
      if (userId) {
        await axios.post(`${API_BASE_URL}/logout/${userId}`);
      }
      clearAuthData();
      toast.info("Logout successful!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed, please try again!");
    }
  }, [API_BASE_URL, userId, clearAuthData]);
  // Helper: Clear all localStorage and state
 

  // Store token and user details in localStorage
  const storeToken = useCallback(
    (serverToken, permData, username, userId, isAdmin) => {
      try {
        const decodedToken = jwtDecode(serverToken);
        const expirationTime = decodedToken.exp * 1000;
        const timeoutDuration = expirationTime - Date.now();

        // Store data in localStorage
        localStorage.setItem("token", serverToken);
        localStorage.setItem("permissions", JSON.stringify(permData));
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);
        localStorage.setItem("isAdmin", JSON.stringify(isAdmin));

        // Update state
        setToken(serverToken);
        setPermissions(permData);
        setUserId(userId);
        setUsername(username);
        setIsAdmin(isAdmin);

        // Set timeout for token expiry
        if (timeoutDuration > 0) {
          setTimeout(() => logoutUser(), timeoutDuration);
        } else {
          logoutUser();
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        logoutUser();
      }
    },
    [logoutUser]
  );

  

  // Check and refresh state on component mount
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const isTokenValid = decodedToken.exp * 1000 > Date.now();
        if (!isTokenValid) {
          logoutUser();
        }
      } catch {
        logoutUser();
      }
    }
  }, [token, logoutUser]);

  return (
    <AuthContext.Provider
      value={{ token, permissions, userId, username, isAdmin, storeToken, logoutUser, isLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };



