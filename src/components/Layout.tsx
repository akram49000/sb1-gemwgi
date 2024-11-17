import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const { user, isAdmin, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Bell className="h-6 w-6 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold">NotifyMe</span>
              </Link>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-indigo-600 transition"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}