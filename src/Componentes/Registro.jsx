import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../Componentes_css/Registro.css'; 

const Registro = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
    // Campos específicos para cada rol
    especialidad: '',       // Para doctores
    licenciaMedica: '',    // Para doctores
    condicionMedica: '',   // Para pacientes
    fechaNacimiento: '',   // Para pacientes
    parentesco: '',        // Para familiares
    pacienteEmail: ''      // Para familiares
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (!selectedRole) {
      return setError('Por favor seleccione un rol');
    }

    try {
      setError('');
      setLoading(true);

      // Preparar datos específicos según el rol
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        role: selectedRole,
      };

      switch (selectedRole) {
        case 'doctor':
          userData.especialidad = formData.especialidad;
          userData.licenciaMedica = formData.licenciaMedica;
          break;
        case 'paciente':
          userData.condicionMedica = formData.condicionMedica;
          userData.fechaNacimiento = formData.fechaNacimiento;
          break;
        case 'familiar':
          userData.parentesco = formData.parentesco;
          userData.pacienteEmail = formData.pacienteEmail;
          break;
      }

      await signup(formData.email, formData.password, selectedRole, userData);
      navigate('/'); // O redirigir al dashboard correspondiente
    } catch (error) {
      setError('Error al crear la cuenta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-content">
        <h2>Registro de Usuario</h2>
        
        {error && <div className="error-message">{error}</div>}

        {/* Selección de Rol */}
        <div className="role-selection">
          <h3>Seleccione su rol:</h3>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${selectedRole === 'paciente' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('paciente')}
            >
              Paciente
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === 'doctor' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('doctor')}
            >
              Doctor
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === 'familiar' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('familiar')}
            >
              Familiar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="registro-form">
          {/* Campos comunes */}
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campos específicos según el rol */}
          {selectedRole === 'doctor' && (
            <>
              <div className="form-group">
                <label>Especialidad</label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Número de Licencia Médica</label>
                <input
                  type="text"
                  name="licenciaMedica"
                  value={formData.licenciaMedica}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {selectedRole === 'paciente' && (
            <>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Condición Médica</label>
                <textarea
                  name="condicionMedica"
                  value={formData.condicionMedica}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {selectedRole === 'familiar' && (
            <>
              <div className="form-group">
                <label>Parentesco con el Paciente</label>
                <input
                  type="text"
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo del Paciente</label>
                <input
                  type="email"
                  name="pacienteEmail"
                  value={formData.pacienteEmail}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el correo del paciente registrado"
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;