import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
//import { TranslationProvider } from './context/translationContext.js'; // Import du provider
import './index.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   
      <App />
    
  </React.StrictMode>
);
