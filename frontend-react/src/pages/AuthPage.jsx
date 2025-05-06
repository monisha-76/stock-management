import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

function AuthPage() {
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("Buyer");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const loginInputRef = useRef(null); // 👈 Reference to login username input

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: loginUsername,
        password: loginPassword,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      setLoginError("Invalid credentials or server error.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username: signupUsername,
        password: signupPassword,
        role: signupRole,
      });
      setSignupSuccess("Signup successful. You can now log in.");
      setSignupUsername("");
      setSignupPassword("");
      setSignupRole("Buyer");

      // 👇 Auto-fill and focus login input
      setLoginUsername(signupUsername);
      setTimeout(() => loginInputRef.current?.focus(), 100);
    } catch (err) {
      if (err.response?.status === 400) {
        setSignupError("User already exists or invalid data.");
      } else {
        setSignupError("Server error.");
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: 'url(/images/background.jpg.png)' }} // Background image
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-60 w-full max-w-5xl justify-center"
      >
        {/* Login Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 w-full max-w-md bg-opacity-80">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              ref={loginInputRef} // 👈 Ref attached
              className="w-full p-3 rounded-lg border border-black dark:border-black bg-white dark:bg-gray-700 text-black dark:text-white"
              autoComplete="off" 
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-black dark:border-black bg-white dark:bg-gray-700 text-black dark:text-white"

              required
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Login
            </button>
          </form>
        </div>

        {/* Signup Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 w-full max-w-md bg-opacity-80">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-200 mb-6 text-center">Register</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-black dark:border-black bg-white dark:bg-gray-700 text-black dark:text-white"

              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-black dark:border-black bg-white dark:bg-gray-700 text-black dark:text-white"

              required
            />
            <select
              value={signupRole}
              onChange={(e) => setSignupRole(e.target.value)}
              className="w-full p-3 rounded-lg border border-black dark:border-black bg-white dark:bg-gray-700 text-black dark:text-white"

            >
              <option value="Admin">Admin</option>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="Owner">Owner</option>
            </select>
            {signupError && <p className="text-red-500 text-sm">{signupError}</p>}
            {signupSuccess && <p className="text-green-600 text-sm">{signupSuccess}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            >
              Signup
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;
