// src/App.js

import React from 'react';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { AuthProvider, useAuth } from './context/AuthContext'; // Adjust path if necessary

const AppContent = () => {
  const { isAuthenticated, user, users, handleLogout } = useAuth();

  return (
    <div>
      <Navbar />
      
      {!isAuthenticated ? (
        <>
          <RegisterForm />
          <LoginForm />
        </>
      ) : (
        <div className='container'>
          <div>Hello, {user ? user.username : 'User'}</div>
          <div>
            <h1>Some content</h1>
            <h2>Registered Users:</h2>
            <ul>
              {users.map((u) => (
                <li key={u.username}>{u.username}</li>
              ))}
            </ul>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
