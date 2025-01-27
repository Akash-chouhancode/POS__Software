import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";
import pizzaImage from "../assets/images/Log_in_pizza.jpg";
import logo from "../assets/images/restrologo.png";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const Log_in = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { storeToken } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false); 
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      // Extract token, username, and permissions from the response
      const { token, username, userId, permData, isAdmin } = response.data;
      console.log("data log in aaya h ", response.data);
      // Store the token and permissions in the context
      storeToken(token, permData, username, userId, isAdmin);

      localStorage.setItem("token", token);

      // Show the toast message with the username
      toast.success(`Log-In successful, Welcome ${username}!`);

      // Redirect to a protected route after login
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Invalid Username or Password"
      );

      setError(error.response?.data?.error || "Login failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-stone-500 via-violet-800 to-blue-900">
      <div
        className="relative flex flex-col md:flex-row items-center justify-center h-auto w-full rounded-md max-w-4xl bg-gray-500 bg-no-repeat bg-cover p-6 md:p-12"
        style={{ backgroundImage: `url(${pizzaImage})` }}
      >
        {/* Overlay */}
        <div className="absolute bg-black opacity-50 inset-0 z-0"></div>

        {/* Text Content */}
        <div className="relative z-10 text-center md:text-left text-white md:max-w-sm pr-10">
          <h1 className="text-4xl font-bold tracking-wide">Keep it special</h1>
          <p className="text-2xl my-4">
            Nothing brings people together like good food.
          </p>
        </div>

        {/* Form */}
        <div className="relative lg:h-[500px] lg:w-[500px] w-full h-auto z-10 mt-8 md:mt-0 bg-white p-8 rounded-md shadow-lg flex flex-col items-center gap-y-14 max-w-sm">
          <img src={logo} alt="Logo" className="mb-4" />
          <div className="border-b-2 border-gray-300 w-full">
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Username"
              className="w-full border-none focus:outline-none text-lg py-2"
              value={email}
              disabled={isLoading}
            />
          </div>

          <div className="relative border-b-2 border-gray-300 w-full">
        <input
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"} // Toggle type based on showPassword
          placeholder="Password"
          className="w-full border-none focus:outline-none text-lg py-2 pr-10"
          value={password}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-2 text-gray-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
          <button
            onClick={handleLogin}
            className={`bg-[#339780] text-white font-semibold py-2 rounded shadow-md hover:bg-[#4CBBA1] transition duration-300 w-full ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
            aria-live="polite"
          >
            {isLoading ? "Logging In..." : "Log-In"}
          </button>
        <Link  to='/forgetpassword' className=" text-[#1b1638] tracking-widest font-serif">forgot password ?</Link>
          {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
        </div>
       
      </div>
    </div>
  );
};

export default Log_in;
