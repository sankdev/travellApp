import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si au moins un rôle est autorisé
  const userRoles = user.roles || [];
  if (!userRoles.some((role) => allowedRoles.includes(role))) {
    const redirectPath =
      userRoles.includes("agency") ? "/agency/dashboard" : "/customer/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;
