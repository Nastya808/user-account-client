import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


function Login() {
  const [user, setUser] = useState({
    username: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.username || !user.password) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const loginData = {
      username: user.username,
      password: user.password
    };

    try {
      const response = await axios.post('https://localhost:7049/api/Users/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setMessage("Login successful!");
        localStorage.setItem('token', response.data.token); 
        console.log(response.data);

        navigate(`/profile/${response.data.id}`); 
      }
    } catch (error) {
      console.error('Login error:', error.response);

      if (error.response && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        let errorMessage = 'Validation errors occurred: ';
        for (const key in validationErrors) {
          errorMessage += `${key}: ${validationErrors[key].join(', ')}; `;
        }
        setMessage(errorMessage);
      } else {
        setMessage("Login failed: " + (error.response?.data?.message || "Invalid credentials."));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
            <input 
              id="username"
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="mt-1 p-4 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <input 
              id="password"
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="mt-1 p-4 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              placeholder="Enter your password"
            />
          </div>

          {message && <p className="text-red-500 text-sm mb-4">{message}</p>}

          <button 
            type="submit" 
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Don't have an account?</span> 
          <Link to="/register" className="ml-1 text-blue-600 font-semibold hover:underline transition duration-300">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
