import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Product from './pages/Product.jsx';
import UsersList from './pages/UsersList.jsx';
import './styles/App.css';

export default function App(){
  const token = localStorage.getItem('token');

  return (
    <Router>
      <header className="navbar">
        <h1>🎮 Fortnite Store</h1>
        <nav>
          <Link to="/">Catálogo</Link>
          <Link to="/users">Usuários</Link>
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registrar</Link>
            </>
          ) : (
            <>
              <Link to="/profile">Perfil</Link>
              <button onClick={() => {localStorage.clear(); window.location.href='/'}}>Logout</button>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/users" element={<UsersList />} />
        </Routes>
      </main>
    </Router>
  );
}