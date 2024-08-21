import React, { useState, useEffect } from 'react';
import api from './api';
import Navbar from './components/Navbar';
import TodoForm from './components/TodoForm';
import TodoFilter from './components/TodoFilter';
import TodoTable from './components/TodoTable';
import LoginForm from './components/LoginForm optional';
import RegisterForm from './components/RegisterForm';
import axios from 'axios';

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    by_date: '',
  });

  const [filter, setFilter] = useState({
    category: '',
    by_date: '',
  });
  
  const [editId, setEditId] = useState(null);

  const fetchTodos = async () => {
    const response = await api.get('/todos/');
    setTodos(response.data);
  };
  const fetchUser = async () => {
    try {
      const response = await api.get('/name/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data');
    } finally {
      console.log("ff");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);



  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
  }, []);



  useEffect(() => {
    fetchTodos();
  }, []);


  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (editId) {
      await api.put(`/todos/${editId}`, formData);
    } else {
      await api.post('/todos/', formData);
    }
    fetchTodos();
    setFormData({
      name: '',
      category: '',
      description: '',
      by_date: '',
    });
    setEditId(null);
  };

  const handleEdit = (todo) => {
    setEditId(todo.id);
    setFormData({
      name: todo.name,
      category: todo.category,
      description: todo.description,
      by_date: todo.by_date,
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/todos/${id}`);
    fetchTodos();
  };

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    const response = await api.get('/todos/filter/', {
      params: filter,
    });
    setTodos(response.data);
  };

  const downloadExcel = async () => {
    const response = await axios.get('http://localhost:8000/scrape');
    console.log(response.data.message);
  };



  return (
    <div>
      <Navbar />
      <RegisterForm />
      {user ? (
        <div>
          
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
      {isAuthenticated ? (
      <div className='container'>
      <div>
      

    </div>
   
        <TodoForm
          formData={formData}
          setFormData={setFormData}
          handleFormSubmit={handleFormSubmit}
          editId={editId}
        />
        <TodoFilter
          filter={filter}
          setFilter={setFilter}
          handleFilterSubmit={handleFilterSubmit}
          downloadExcel={downloadExcel}
        />
        <TodoTable
          todos={todos}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
        <button onClick={handleLogout}>Logout</button>
      </div>
      ) : (
        
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
