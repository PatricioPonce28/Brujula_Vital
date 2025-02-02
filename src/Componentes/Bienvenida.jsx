import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Componentes_css/Bienvenida.css';
import logo from './../assets/logo.jpeg';

const Bienvenida = () => {
  const navigate = useNavigate();

  return (
    <div className="bienvenida-container">
      <div className="logo-container">
        <img src={logo} alt="Logo Brújula Vital" className="logo" />
      </div>

      <div className="content-wrapper">
        <h1 className="main-title">Bienvenidos a Brújula Vital</h1>
        <p className="slogan">Cada día es una nueva oportunidad</p>

        <div className="buttons-container">
          <button 
            className="action-button login-btn"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
          <button 
            className="action-button register-btn"
            onClick={() => navigate('/registro')}
          >
            Registrarse
          </button>
        </div>

        {/* Contenedor del Video */}
        <div className="video-container">
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/KsqM2zf_vRw?si=qio2CGO6IrA-ELIA" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          >
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default Bienvenida;