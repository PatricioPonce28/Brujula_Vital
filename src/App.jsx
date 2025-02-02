import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import Bienvenida from './Componentes/Bienvenida';
import MisionVision from './Componentes/MisionVision';
import Contacto from './Componentes/Contacto';
import InformacionExtra from './Componentes/Informacion';
import Login from './Componentes/Login';
import Registro from './Componentes/Registro';
import logo from './assets/logo.jpeg';
import DashboardPaciente from './Componentes/DashboardPaciente';
import DashboardDoctor from './Componentes/DashboardDoctor';
import DashboardFamiliar from './Componentes/DashboardFamiliar';
import DashboardAdministrador from './Componentes/DashboardAdministrador';


const HomePage = () => {
  return (
    <>
      <div className="logo-container">
        <img src={logo} alt="Logo Clínica" className="logo" />
      </div>
      <Bienvenida />
      <MisionVision />
      <InformacionExtra />
      <Contacto />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<HomePage />} />

            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Rutas protegidas - Se agregarán después */}
            <Route path="/paciente-dashboard" element={<DashboardPaciente />} />
            <Route path="/doctor-dashboard" element={<DashboardDoctor/>} />
            <Route path="/familiar-dashboard" element={<DashboardFamiliar/>} />
            <Route path="/admin-dashboard" element={<DashboardAdministrador/>} />

            {/* Ruta para manejar páginas no encontradas */}
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;