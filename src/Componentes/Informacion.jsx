import React from 'react';
import '../Componentes_css/Informacion.css'; 

const Informacion = () => {
  return (
    <div className="info-extra-container">
      <div className="info-extra-content">
        <h2 className="info-extra-title">Información Adicional</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3 className="section-title">Servicios</h3>
            <ul className="info-list">
              <li className="info-item">Internamiento residencia</li>
              <li className="info-item">Evaluación y diagnóstico </li>
              <li className="info-item">Desintoxicación médica</li>
              <li className="info-item">Terapia individual </li>
              <li className="info-item">Terapia Grupal </li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3 className="section-title">Alojamiento y Cuidado</h3>
            <ul className="info-list">
              <li className="info-item">Centro de día </li>
              <li className="info-item">Seguimiento post-tratamiento</li>
              <li className="info-item">Asistencia nutricional </li>
              <li className="info-item">Atención 24/7</li>
              <li className="info-item">Visitas Familiares</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3 className="section-title">Apoyo y Rehabilitación Social</h3>
            <ul className="info-list">
              <li className="info-item">Reintegración social </li>
              <li className="info-item">Educación y capacitación</li>
              <li className="info-item">Actividades recreativas</li>
              <li className="info-item">Apoyo espiritual</li>
              <li className="info-item">Grupos de autoayuda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informacion;