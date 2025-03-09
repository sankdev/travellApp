// import React from "react";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   if (!token || !user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Vérifier si au moins un rôle est autorisé
//   const userRoles = user.roles || [];
//   if (!userRoles.some((role) => allowedRoles.includes(role))) {
//     const redirectPath =
//       userRoles.includes("agency") ? "/agency/dashboard" : "/customer/dashboard";
//     return <Navigate to={redirectPath} replace />;
//   }

//   return children;
// };

// export default PrivateRoute;
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user.roles || [];

  // L'admin a accès à tous les dashboards
  if (userRoles.includes("admin")) {
    return children;
  }

  // Vérifie si l'utilisateur a un rôle autorisé
  if (!userRoles.some((role) => allowedRoles.includes(role))) {
    // Redirection en fonction du rôle
    const redirectPath = userRoles.includes("agency")
      ? "/agency/dashboard"
      : userRoles.includes("customer")
      ? "/customer/dashboard"
      : "/";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;
