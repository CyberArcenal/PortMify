// main.tsx
import ReactDOM from 'react-dom/client'
import "./styles/App.css";
import "./styles/App-dark.css";
import "./styles/scrollbar.css";
import "./styles/animation.css";
import "./styles/dashboard.css";
import "reflect-metadata";
import React from 'react';
import ConditionalRouter from './components/Shared/ConditionalRouter';
import App from './routes/App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './lib/auth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ConditionalRouter>
          <App />
        </ConditionalRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)