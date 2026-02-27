import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
      <Link to={isAuthenticated ? '/profile' : '/'} className="font-bold text-lg hover:opacity-80">
        L² Platform
      </Link>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Profile
            </Link>
            <Link to="/skills" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Skills
            </Link>
            <Link to="/match" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Match
            </Link>
            <Link to="/chat" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Chat
            </Link>
            <Link to="/video" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Video
            </Link>
            <Link to="/requests" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Requests
            </Link>
            <div className="border-l border-blue-400 pl-4 ml-4">
              <span className="text-sm mr-3">{user?.name || 'User'}</span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hover:bg-blue-700 px-3 py-2 rounded transition disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Login
            </Link>
            <Link to="/register" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
