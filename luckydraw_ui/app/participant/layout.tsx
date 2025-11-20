import { Outlet, NavLink } from "react-router";
import AuthMiddleware from "utils/participant-middleware";
import { Home, User, Gift } from "lucide-react";

export default function ParticipantLayout() {
  return (
    <AuthMiddleware>
      <div className="flex gap-2 min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Sidebar Navigation */}
        <div className="w-64 flex flex-col gap-2 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lucky Draw
            </h1>
            <p className="text-sm text-gray-500 mt-1">Participant Portal</p>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <NavLink
              to="/participant"
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
              to="/participant/profile"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
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
