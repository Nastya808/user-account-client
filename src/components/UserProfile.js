import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '', 
  });
  const [originalProfile, setOriginalProfile] = useState({ ...profile });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage("You are not logged in.");
          navigate('/login');
          return;
        }

        setLoading(true);

        const response = await axios.get(`https://localhost:7049/api/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          setProfile(response.data);
          setOriginalProfile(response.data); 
        } else {
          setMessage("Failed to load profile data.");
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (error.response) {
          setMessage(`Error fetching profile: ${error.response.data.message || error.response.statusText}`);
        } else {
          setMessage("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!profile.firstName || !profile.lastName || !profile.email || !profile.password) {
      setMessage("All fields are required.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage("You are not logged in.");
        navigate('/login');
        return;
      }

      console.log("Profile data being sent:", profile);  

      const response = await axios.put(`https://localhost:7049/api/users/${id}`, profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response);  

      if (response.status === 200) {
        setProfile(response.data);  
        setMessage('Profile updated successfully.');
        setIsEditing(false); 
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);

      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        console.error('Error response data:', error.response.data);

        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          console.error('Validation errors:', validationErrors);
          setMessage(`Validation error: ${Object.values(validationErrors).map(err => err.join(', ')).join('; ')}`);
        } else {
          setMessage(`Error updating profile: ${error.response.data?.message || error.response.statusText}`);
        }
      } else {
        setMessage('An unexpected error occurred while saving the changes.');
      }
    }
  };

  const handleCancelChanges = () => {
    setProfile(originalProfile); 
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading profile...</p>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">User Profile</h2>

        <div className="text-lg text-gray-700">
          {isEditing ? (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Username:</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Password:</label>
                <input
                  type="password"
                  name="password"
                  value={profile.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={handleSaveChanges}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 mr-4"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelChanges}
                  className="py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>First Name:</strong> {profile.firstName}</p>
              <p><strong>Last Name:</strong> {profile.lastName}</p>
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}

          {message && <p className="text-center text-green-600 mt-4">{message}</p>}

          <div className="mt-6 text-center">
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
