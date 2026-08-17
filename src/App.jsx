import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewInvoice from './pages/billing/NewInvoice';
import InvoiceList from './pages/billing/InvoiceList';
import InvoiceDetails from './pages/billing/InvoiceDetails';
import ProductsList from './pages/products/ProductsList';
import AddProduct from './pages/products/AddProduct';
import ProductDetails from './pages/products/ProductDetails';
import CustomersList from './pages/customers/CustomersList';
import AddCustomer from './pages/customers/AddCustomer';
import ContactUsList from './pages/contact/ContactUsList';
import TestimonialsList from './pages/testimonials/TestimonialsList';
import PurchasesList from './pages/purchases/PurchasesList';
import AddPurchase from './pages/purchases/AddPurchase';
import ExpensesList from './pages/expenses/ExpensesList';
import AddExpense from './pages/expenses/AddExpense';
import Reports from './pages/reports/Reports';
import UsersList from './pages/users/UsersList';
import AddUser from './pages/users/AddUser';
import Settings from './pages/settings/Settings';
import Login from './pages/auth/Login';
import GalleryList from './pages/gallery/GalleryList';
const Layout = ({ children, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-text-main">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onLogout={onLogout} />
      <div className="flex-1 flex flex-col w-full h-full">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing/new" element={<NewInvoice />} />
          <Route path="/billing/list" element={<InvoiceList />} />
          <Route path="/billing/details/:id" element={<InvoiceDetails />} />
          
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/details/:id" element={<ProductDetails />} />
          
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/new" element={<AddCustomer />} />
          <Route path="/contact" element={<ContactUsList />} />
          <Route path="/testimonials" element={<TestimonialsList />} />
          <Route path="/gallery" element={<GalleryList />} />
          
          <Route path="/purchases" element={<PurchasesList />} />
          <Route path="/purchases/new" element={<AddPurchase />} />
          <Route path="/purchases/edit/:id" element={<AddPurchase />} />
          
          <Route path="/expenses" element={<ExpensesList />} />
          <Route path="/expenses/new" element={<AddExpense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/new" element={<AddUser />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch all unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
