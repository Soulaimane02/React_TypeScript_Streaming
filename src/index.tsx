import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import HomePage from './pages/home/home';
import LoginPage from './pages/login/login';
import Signup from './pages/signup/signup';
import ProfilManagement from './pages/profilManagement/profilManagement';
import MoviePage from './pages/movie/movie'; 
import SeriePage from './pages/serie/serie'; 
import reportWebVitals from './reportWebVitals';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../src/pages/appContext'; 
import { AccessProvider } from './pages/AccesProvider';
import AccessCodePage from './pages/AccessCodePage';
import ProtectedAccessRoute from './pages/ProtectedAccessRoute';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AccessProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/access-code" element={<AccessCodePage />} />
            <Route path="/" element={<ProtectedAccessRoute><HomePage /></ProtectedAccessRoute>} /> 
            <Route path="/login" element={<ProtectedAccessRoute><LoginPage /></ProtectedAccessRoute>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/movie/:id" element={<ProtectedAccessRoute><MoviePage /></ProtectedAccessRoute>} /> 
            <Route path="/serie/:id" element={<ProtectedAccessRoute><SeriePage /></ProtectedAccessRoute>} /> 
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AccessProvider>
  </React.StrictMode>
);

// <Route path="/who" element={<ProfilManagement />} />
reportWebVitals();
