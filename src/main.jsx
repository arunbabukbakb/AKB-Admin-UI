import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store/store';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { registerTokenRefreshHandler, registerLogoutHandler } from './services/api';
import { updateToken, logout } from './store/authSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

registerTokenRefreshHandler((tokens) => {
  store.dispatch(updateToken(tokens));
});

registerLogoutHandler(() => {
  store.dispatch(logout());
});

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

console.log("AuraAdmin initialized. API Endpoint Loaded:", import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
