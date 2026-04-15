import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">PrimeTrade</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500 uppercase">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-50 border border-transparent text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500">Not logged in</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
