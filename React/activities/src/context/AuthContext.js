// src/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      fetchUser();
      fetchUsers();
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUser();
    fetchUsers();
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/user/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/users/');
        setUsers(response.data);
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
};

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, users, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
