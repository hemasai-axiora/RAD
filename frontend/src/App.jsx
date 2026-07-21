import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, GuestRoute } from './components/RouteGuard';
import { Layout } from './components/Layout';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Customers } from './pages/Customers';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
        <Routes>
          {/* Guest Routes: Login page only accessible if not logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes: Accessible only to authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              
              {/* POS Billing Route - Cashier / Admin / Manager */}
              <Route path="/" element={<POS />} />
              
              {/* Inventory Module - Staff / Admin / Manager */}
              <Route 
                path="/inventory" 
                element={<ProtectedRoute requiredModule="inventory" requiredAction="read" />}
              >
                <Route index element={<Inventory />} />
              </Route>

              {/* Customers Profile Route - Cashier / Admin / Manager */}
              <Route 
                path="/customers" 
                element={<ProtectedRoute requiredModule="customers" requiredAction="read" />}
              >
                <Route index element={<Customers />} />
              </Route>

              {/* Reports Dashboard Route - Admin / Manager */}
              <Route 
                path="/reports" 
                element={<ProtectedRoute requiredModule="reports" requiredAction="read" />}
              >
                <Route index element={<Reports />} />
              </Route>

            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
