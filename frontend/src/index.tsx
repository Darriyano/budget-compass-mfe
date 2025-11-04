import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Get base path from environment or use default
const basePath = process.env.REACT_APP_BASE_PATH || ''

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <AuthProvider>
        <BudgetProvider>
          <App />
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);