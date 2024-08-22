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
            <h1>-=-=-=-=-</h1>
            <h2>Registered Users:</h2>
            <ul>
            <ul>
  {users.map((u) => (
    <li key={u.username}>
      <div><strong>Username:</strong> {u.username}</div>
      <div><strong>Firstname:</strong> {u.name}</div>
      <div><strong>Lastname:</strong> {u.lastname}</div>
      <div><strong>Email:</strong> {u.email}</div>
      <div><strong>Password:</strong> hidden {u.password}</div>
    </li>
  ))}
</ul>
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
