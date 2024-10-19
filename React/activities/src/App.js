import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import axios from 'axios';

const AppContent = () => {
  const { isAuthenticated, user, users, handleLogout } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({
    username: '',
    name: '',
    lastname: '',
    email: '',
    password: ''
  });

  const handleEditClick = (user) => {
    setEditingUser(user.username);
    setEditData({
      username: user.username,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      password: '' // Keep password empty initially
    });
  };

  const handleDelete = async (username) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/users/${username}`);
      window.location.reload(); // Refresh the page to reflect changes
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/users/${editingUser}`, editData);
      setEditingUser(null); // Exit edit mode
      window.location.reload(); // Refresh the page to reflect changes
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

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
              {users.map((u) => (
                <li key={u.username}>
                  {editingUser === u.username ? (
                    <div>
                      <input 
                        type="text" 
                        value={editData.name} 
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                      />
                      <input 
                        type="text" 
                        value={editData.lastname} 
                        onChange={(e) => setEditData({ ...editData, lastname: e.target.value })} 
                      />
                      <input 
                        type="email" 
                        value={editData.email} 
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })} 
                      />
                      <input 
                        type="password" 
                        placeholder="New password" 
                        onChange={(e) => setEditData({ ...editData, password: e.target.value })} 
                      />
                      <button onClick={handleSaveEdit}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div>
                      <div><strong>Username:</strong> {u.username}</div>
                      <div><strong>Firstname:</strong> {u.name}</div>
                      <div><strong>Lastname:</strong> {u.lastname}</div>
                      <div><strong>Email:</strong> {u.email}</div>
                      <button onClick={() => handleEditClick(u)}>Edit</button>
                      <button onClick={() => handleDelete(u.username)}>Delete</button>
                    </div>
                  )}
                </li>
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
