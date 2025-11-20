import { Outlet } from "react-router";
import AuthMiddleware from "utils/admin-middleware";
import { Home, Gift, History, Users } from "lucide-react";
import { NavLink } from "react-router";

export default function AdminLayout() {
  return (
    <AuthMiddleware>
      <div className="flex gap-2 min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar Navigation */}
        <div className="w-64 flex flex-col gap-2 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-500 mt-1">Lucky Draw System</p>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </NavLink>
            <NavLink
              to="/admin/draws"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Gift className="w-5 h-5" />
              <span className="font-medium">Draws</span>
            </NavLink>
            <NavLink
              to="/admin/history"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <History className="w-5 h-5" />
              <span className="font-medium">History & Reports</span>
            </NavLink>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </AuthMiddleware>
  );
}
