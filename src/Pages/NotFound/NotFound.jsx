// src/admin/components/NotFound/NotFound.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './NotFound.css';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const availableRoutes = [
    '/', '/aboutUs', '/newsFeed', '/deliveryInfo', '/privacy-policy',
    '/fleets', '/searchInput', '/searchRides', '/cart',
    '/profile', '/checkout', '/my-bookings', '/track-ride',
    '/admin/dashboard', '/admin/users'
  ];
 
  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) return;
    const match = availableRoutes.find(path => path.toLowerCase().endsWith(term));
    if (match) return navigate(match);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
    <Helmet>
      <link rel="icon" type="image/png" href="/icons/globe.png" />
      <title>Error 404(Not Found)!!</title>
    </Helmet>
    <div className="nf-container">
        <img src="/error.png" alt='robot crash' className='robot'/>
      <div className="nf-box">
        <Link to="/">
        <h2 className="logo"><em>GoOn</em></h2>
      </Link>
        <h1 className="nf-code">404</h1>
        <p className="nf-text">
          Sorry, we can’t find that page. <strong>{location.pathname}</strong> does not exist or has been moved.
        </p>
        <form className="nf-search" onSubmit={handleSearch}>
          <Search size={20} className="nf-icon" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for what you need"
            aria-label="Search site"
          />
        </form>
        <div className="nf-links">
          <Link to="/" className="nf-link">
            Home 
          </Link>
          <Link to="/my-bookings" className="nf-link">
            Bookings
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}