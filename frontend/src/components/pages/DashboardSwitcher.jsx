import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faBuilding, faUser } from "@fortawesome/free-solid-svg-icons";

const DashboardSwitcher = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.roles.includes("admin")) return null;

  const dashboards = [
    { name: "Admin", path: "/admin/dashboard", color: "bg-blue-600", icon: faUserShield },
    { name: "Agency", path: "/agency/dashboard", color: "bg-green-600", icon: faBuilding },
    { name: "Customer", path: "/customer/dashboard", color: "bg-yellow-600", icon: faUser },
  ];

  return (
    <div className="w-full px-4 py-3 bg-white shadow-md flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {dashboards.map((dashboard) => (
          <button
            key={dashboard.name}
            onClick={() => navigate(dashboard.path)}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 ease-in-out 
                        ${dashboard.color} hover:opacity-80 focus:ring-4 focus:ring-opacity-50`}
          >
            <FontAwesomeIcon icon={dashboard.icon} className="text-lg" />
            <span className="text-sm font-semibold">{dashboard.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardSwitcher;
