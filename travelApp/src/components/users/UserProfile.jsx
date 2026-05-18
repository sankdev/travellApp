import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService'; // Import userService

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await userService.getCurrentUser();
        console.log('userData',userData) // Use userService to fetch user data
        setUser(userData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

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

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">User not found</h2>
        <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/users')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Users List
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-12">
            <div className="relative">
              <div className="absolute top-0 right-0">
                <button
                  onClick={() => navigate('/users')}
                  className="text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                  ← Back to List
                </button>
              </div>
              <div className="w-32 h-32 rounded-full bg-white mx-auto mb-8 flex items-center justify-center">
                <span className="text-5xl font-bold text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white text-center">{user.name}</h1>
              <p className="text-indigo-100 text-center mt-2">{user.email}</p>
              <div className="flex justify-center mt-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium
                  ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'user' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {user.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-lg text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {user.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-lg text-gray-900">{user.address}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                  <p className="mt-1 text-lg">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="px-6 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                Edit Profile
              </button>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
