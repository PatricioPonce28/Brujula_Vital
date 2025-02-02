import React from 'react';
import '../Componentes_css/MisionVision.css'; 

const MisionVision = () => {
  return (
    <section className="section-container mision-vision-container fade-in">
      <div className="mision-vision-content">
        <div className="text-section">
          <div className="mision-section">
            <h2>Misión</h2>
            <p>
              Nuestra misión es proporcionar servicios de rehabilitación para personas 
              con problemas de drogadicción, centrados en el paciente, utilizando técnicas 
              innovadoras y un equipo profesional altamente capacitado. Nos 
              comprometemos a mejorar la calidad de vida de nuestros pacientes 
              a través de tratamientos personalizados y un enfoque integral en 
              su recuperación.
            </p>
          </div>

          <div className="vision-section">
            <h2>Visión</h2>
            <p>
              Ser reconocidos como el centro de rehabilitación líder por 
              el trato hacia nuestros pacientes, destacando por la excelencia en el servicio, 
              la innovación en tratamientos y el compromiso con el bienestar 
              integral de nuestros pacientes. Aspiramos a ser referentes en 
              la implementación de nuevas técnicas y métodos de rehabilitación, 
              manteniendo siempre un trato humano y personalizado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MisionVision;