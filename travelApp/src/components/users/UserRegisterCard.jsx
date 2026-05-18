import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";

import { faCheck, faEnvelope, faLock, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", roleId: "",roleName:" " });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getAllRoles();
        setRoles(response || []); // Ensure roles is always an array
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRoles([]); // Fallback to an empty array on error
      }
    };
    fetchRoles();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    // if (!formData.roleId) {
    //   setError("Veuillez sélectionner un rôle");
    //   return false;
    // }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    try {
      await userService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleId: formData.roleId,
        roleName:formData.roleName
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

//   <div>
//   <select
//     name="roleId"
//     required
//     className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
//     value={formData.roleId}
//     onChange={handleChange}
//   >
//     <option value="">Sélectionner un rôle</option>
//     {roles.filter((r) => ["agency", "customer"].includes(r.name)).map((role) => (
//       <option key={role.id} value={role.id}>
//         {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
//       </option>
//     ))}
//   </select>
// </div>

  {/* Nouveau rôle */}
//   <div className="flex items-center border rounded-lg p-2 bg-gray-100">
//   <FontAwesomeIcon icon={faCheck} className="text-gray-500 mr-2" />
//   <input
//     type="text"
//     name="roleName"
//     placeholder="Créer un nouveau rôle"
//     value={formData.roleName || ""}
//     onChange={handleChange}
//     disabled={formData.roleId !== ""}
//     className="bg-transparent flex-1 outline-none"
//   />
// </div>

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 to-purple-200 flex items-center justify-center py-12 px-6 lg:px-8">

   
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">Créer un compte</h2>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {[
            { id: "name", type: "text", icon: faUser, placeholder: "Nom complet" },
            { id: "email", type: "email", icon: faEnvelope, placeholder: "Adresse email" },
            { id: "password", type: "password", icon: faLock, placeholder: "Mot de passe" },
          ].map((field) => (
            <div key={field.id} className="relative">
              <FontAwesomeIcon icon={field.icon} className="absolute left-3 top-3 text-gray-400" />
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                required
                className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder={field.placeholder}
                value={formData[field.id]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div>
            <select
              name="roleId"
              
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
              value={formData.roleId}
              onChange={handleChange}
            >
              <option value="">Sélectionner un rôle</option>
              {Object.values(roles)?.filter((r) => ["agency", "customer"].includes(r.name)).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : null}
            Créer un compte
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Vous avez déjà un compte ?
            <button
              onClick={() => navigate("/login")}
              className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Se connecter
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
