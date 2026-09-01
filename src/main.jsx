// main.jsx
import "leaflet/dist/leaflet.css";
import './i18n';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes/Theme/Theme.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate }             from 'redux-persist/integration/react';
import { persistStore }            from 'redux-persist';
import { BrowserRouter }           from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { IdleTimerProvider }       from 'react-idle-timer';

import App                         from './App.jsx';
import ErrorBoundary               from './shared/components/ErrorBoundary/ErrorBoundary.jsx';
import store                       from './app/store';
import './App.css';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import NetworkStatusSnackbar from './shared/components/NetworkStatusSnackbar/NetworkStatusSnackbar.jsx';
import { CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import GoogleMapsProvider from "./provider/GoogleMapsProvider/GoogleMapsProvider.jsx";

const nonce = window.__CSP_NONCE__;
const emotionCache = createCache({ key: "css", nonce });

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
const IDLE_TIMEOUT     = 480 * 60 * 1000;
const persistor        = persistStore(store);

// Register Service Worker for Firebase Messaging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js', { scope: '/' })
    .then(reg => console.log('✅ Service worker registered with scope:', reg.scope))
    .catch(err => console.error('❌ Service worker registration failed:', err));
}
 
ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <ScrollToTop/>
        <NetworkStatusSnackbar/>
        <CssBaseline/>
        <HelmetProvider>
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <GoogleReCaptchaProvider
              reCaptchaKey={RECAPTCHA_SITE_KEY}
              scriptProps={{ async: true, defer: true, appendTo: 'head' }}
            >
                <ToastContainer position="top-right" />
                <CacheProvider value={emotionCache}>
                  <GoogleMapsProvider>
                <App />
                </GoogleMapsProvider>
                </CacheProvider>
            </GoogleReCaptchaProvider>
          </ErrorBoundary>
          </ThemeProvider> 
          </HelmetProvider>
      </BrowserRouter>
    </PersistGate>
  </ReduxProvider>
);