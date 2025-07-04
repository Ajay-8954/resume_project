import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/validate', {
        withCredentials: true
      });
      setUser(response.data.user);
    } catch (err) {
      navigate('/login');
    }
  };



  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <h2 className="text-2xl font-semibold">Welcome, {user.username}!</h2>
        <p className="text-gray-600 mt-2">Email: {user.email}</p>
        {/* Add your dashboard content here */}
      </div>
    </div>
  );
};

export default Dashboard;