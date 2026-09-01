// src/components/AuthLayout/AuthLayout.jsx
import React from "react";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
import { Helmet } from "react-helmet-async";
export default function AuthLayout({ children }) {
  return (
    <>
    <Helmet>
      <html lang="en" translate="yes" draggable="false" dir="ltr" />

      <meta charSet="UTF-8" />
      <link rel="icon" type="image/png" href="/GN-logo.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="TOLI-TOLI is a ride-hailing platform that connects drivers and passengers for convenient transportation services." />
      <meta name="keywords" content="TOLI-TOLI, ride-hailing platform, transportation, drivers, passengers" />
      <meta name="author" content="TOLI-TOLI Team" />
      <link rel="manifest" href="manifest.json" />
      <link rel="apple-touch-icon" href="/TT-logo-180x180.png" />
      <title>GoOn - Driver</title>
    </Helmet>
      <Navbar />
      <hr />
      <div className="app">
        {children}
        <Footer/>
      </div>
    </>
  );
}
