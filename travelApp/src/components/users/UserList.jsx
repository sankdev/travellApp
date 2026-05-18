import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
            Users Directory
          </h2>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <Link
              to={`/users/${user._id}`}
              key={user._id}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                  <div className="w-20 h-20 rounded-full bg-white mx-auto flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h3>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'user' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                    View Profile →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl">
              No users found matching your search.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
