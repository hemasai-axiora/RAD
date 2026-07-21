import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requiredModule, requiredAction }) => {
  const { token, user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredModule && requiredAction && !hasPermission(requiredModule, requiredAction)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-slate-200">
        <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-slate-400">You do not have permission to access this module ({requiredModule}).</p>
      </div>
    );
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
