// In src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './context/AppContext'; // Import your provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 
      By wrapping AppProvider here, you make the context available 
      to your ENTIRE application (including all routes and components).
      This is the correct place for it.
    */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);