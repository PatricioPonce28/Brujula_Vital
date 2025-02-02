import React from 'react';
import '../Componentes_css/Contacto.css'; 

const Contacto = () => {
  return (
    <div className="contacto-container">
      <div className="contacto-content">
        <h2 className="contacto-title">Contacto</h2>
        <div className="contacto-grid">
          <div className="contacto-card">
            <h3 className="card-title">Información de Contacto</h3>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <a href="tel:+123456789" className="contact-link">(+593) 98-465-5005</a>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <a href="mailto:contacto@clinica.com" className="contact-link">gean.ponce@epn.edu.ec</a>
            </div>
          </div>

          <div className="contacto-card">
            <h3 className="card-title">Ubicación</h3>
            <p>Escuela Politécnica Nacional</p>
            <p>Quito, Ecuador</p>
            <div className="map-container">
              <iframe
                title="Mapa EPN"
                className="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15958.413388723304!2d-78.492003!3d-0.210351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a0758336be3%3A0x1ff981dfb9b85cd!2sEscuela%20Politécnica%20Nacional!5e0!3m2!1ses!2sec!4v1706900000000"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div className="contacto-card">
            <h3 className="card-title">Redes Sociales</h3>
            <div className="social-links">
              <a 
                href="https://www.facebook.com/gean.patricio/" 
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-icon">👍</span>
                Facebook
              </a>
              <a 
                href="https://www.instagram.com/duck_mc666/" 
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-icon">📸</span>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
