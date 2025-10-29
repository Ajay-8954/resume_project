import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import {
  LogIn,
  UserPlus,
  LogOut,
  PlusCircle,
  Filter,
  Crown,
  Settings,
  Users,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    loading,
    setAuth,
    setLoading,
    logout,
    isOrganizationMember,
    isSuperAdmin,
  } = useAuthStore();
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/auth/validate",
          { withCredentials: true }
        );
        if (response.data.valid) {
          setAuth(true, response.data.user);
        }
      } catch (error) {
        setAuth(false, null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setAuth, setLoading]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <header className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-gray-50 shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <h1 className="text-xl sm:text-2xl font-extrabold text-blue-600 transition-transform duration-300 hover:scale-105">
          Resumaze
        </h1>
        <div className="w-20 sm:w-24 h-6 bg-blue-200 rounded animate-pulse"></div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-gray-50 shadow-lg border-b border-blue-100 sticky top-0 z-50">
      <h1
        className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600 cursor-pointer transition-all duration-300 hover:scale-105 hover:text-blue-700 hover:shadow-md bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg"
        onClick={() => navigate("/")}
      >
        Resumaze
      </h1>

      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6">
        {isAuthenticated ? (
          <>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-md border border-gray-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-gray-800 text-xs sm:text-sm md:text-base font-semibold hidden sm:inline pr-2">
                Welcome, {user?.username}
              </span>
              {/* Super Admin Badge */}
              {isSuperAdmin() && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm hover:bg-purple-200 transition-colors duration-200">
                  <Crown size={12} />
                  Super Admin
                </span>
              )}
              {/* HR Member Badge */}
              {isOrganizationMember() && !isSuperAdmin() && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm hover:bg-green-200 transition-colors duration-200">
                  <Users size={12} />
                  HR Member
                </span>
              )}
            </div>

            {/* Super Admin Panel Button */}
            {isSuperAdmin() && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-1 sm:gap-2 text-purple-600 bg-purple-50 border border-purple-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm hover:bg-purple-100 hover:text-purple-700 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 text-sm sm:text-base font-medium"
                disabled={logoutLoading}
              >
                <Settings size={16} className="sm:w-4 sm:h-4 text-purple-600" />
                <span className="hidden xs:inline">Admin Panel</span>
              </button>
            )}

            {/* Dashboard Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 sm:gap-2 text-blue-600 bg-blue-50 border border-blue-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm hover:bg-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm sm:text-base font-medium"
              disabled={logoutLoading}
            >
              <PlusCircle size={16} className="sm:w-4 sm:h-4 text-blue-600" />
              <span className="hidden xs:inline">Dashboard</span>
            </button>

            {/* Filter Resumes Button - Only for Organization Members */}
            {isOrganizationMember() && (
              <button
                onClick={() => navigate("/filter-resumes")}
                className="flex items-center gap-1 sm:gap-2 md:gap-3 text-green-700 bg-green-50 border-2 border-green-200 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl shadow-lg hover:bg-green-100 hover:text-green-800 hover:shadow-xl hover:border-green-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-200 focus:ring-opacity-50 text-sm sm:text-base md:text-lg font-semibold"
                disabled={logoutLoading}
              >
                <Filter
                  size={16}
                  className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-700 flex-shrink-0"
                />
                <span className="hidden xs:inline">Filter Resumes</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm sm:text-base font-medium hover:shadow-lg"
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <div className="flex items-center gap-1 sm:gap-2 animate-pulse">
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden xs:inline">Logging Out...</span>
                </div>
              ) : (
                <>
                  <LogOut size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1 sm:gap-2 text-blue-600 bg-blue-50 border border-blue-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm hover:bg-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm sm:text-base font-medium"
            >
              <LogIn size={16} className="sm:w-4 sm:h-4 text-blue-600" />
              <span className="hidden xs:inline">Login</span>
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-sm sm:text-base font-medium hover:shadow-lg"
            >
              <UserPlus size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sign Up</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
