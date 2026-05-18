import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faSpinner,
  faTimes,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const UserLogin = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await userService.login(formData);
      if (!response?.user || !response?.token) {
        throw new Error("Invalid credentials");
      }

      try {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
      } catch {
        throw new Error("Storage error: Unable to save session data.");
      }

      switch (response.user.roles?.[0]) {
        case "admin":
          navigate("/admin");
          break;
        case "agency":
          navigate("/agency/dashboard");
          break;
        case "customer":
          navigate("/customer/dashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    if (onClose) {
      onClose(); // Si une fonction onClose est fournie, l'appeler
    }
    navigate("/"); // Rediriger vers la page d'accueil
  };


  return (
    <div className="min-h-small flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-500 p-1">
       
      <div className="bg-white shadow-lg rounded-2xl p-5 max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Sign in to your account
        </h2>

        {error && (
          <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="text-indigo-600" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-2 text-white font-semibold rounded-lg transition-all ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}
            Sign in
          </button>
        </form>

        <div className="relative flex justify-center my-6">
          <span className="bg-white px-4 text-gray-500">Or continue with</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Sign in with Google
          </button>
          <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Sign in with GitHub
          </button>
        </div>

        {/* Lien vers l'inscription */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Or{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
