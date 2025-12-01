import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Chores from './components/Chores';
import Expenses from './components/Expenses';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import RequireAuth from './components/RequireAuth';
import './App.css';

function App() {
  console.log('App imports check:', { AppDataProvider, Layout, Login, Register, Dashboard, Chores, Expenses, Settings });
  console.log('Router imports check:', { Router, Routes, Route });
  const missing = [];
  if (typeof AppDataProvider === 'undefined') missing.push('AppDataProvider');
  if (typeof Layout === 'undefined') missing.push('Layout');
  if (typeof Login === 'undefined') missing.push('Login');
  if (typeof Register === 'undefined') missing.push('Register');
  if (typeof Dashboard === 'undefined') missing.push('Dashboard');
  if (typeof Chores === 'undefined') missing.push('Chores');
  if (typeof Expenses === 'undefined') missing.push('Expenses');
  if (typeof Settings === 'undefined') missing.push('Settings');
  if (missing.length > 0) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Import error: missing components</h2>
        <p>The following imports are undefined (check exports/imports):</p>
        <ul>
          {missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p>Open the dev console for more details.</p>
      </div>
    );
  }

  return (
    <AppDataProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <RequireAuth>
                <Layout><Dashboard /></Layout>
              </RequireAuth>
            } />
            <Route path="/chores" element={
              <RequireAuth>
                <Layout><Chores /></Layout>
              </RequireAuth>
            } />
            <Route path="/expenses" element={
              <RequireAuth>
                <Layout><Expenses /></Layout>
              </RequireAuth>
            } />
            <Route path="/calendar" element={
              <RequireAuth>
                <Layout><Calendar /></Layout>
              </RequireAuth>
            } />
            <Route path="/settings" element={
              <RequireAuth>
                <Layout><Settings /></Layout>
              </RequireAuth>
            } />
          </Routes>
        </div>
      </Router>
    </AppDataProvider>
  );
}

export default App;
