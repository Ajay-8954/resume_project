import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore'; // Tumhara Zustand store ka sahi import path lagao

const Navbar = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    loading,
    setAuth,
    setLoading,
    logout
  } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:5000/api/auth/validate',
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
    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white">
        <h1 className="text-2xl font-bold text-blue-600">ResumeMatcher</h1>
        <div className="w-24"></div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white">
      <h1 
        className="text-2xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate('/')}
      >
        ResumeMatcher
      </h1>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="text-gray-700 hidden sm:inline">
              Welcome, {user?.username}
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:underline"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
