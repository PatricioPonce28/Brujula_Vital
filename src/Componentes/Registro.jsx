import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
    especialidad: '',
    licenciaMedica: '',
    condicionMedica: '',
    fechaNacimiento: '',
    parentesco: '',
    pacienteEmail: ''
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

  const handleRegister = async (role, userData) => {
    try {
      if (role === 'familiar') {
        // Verificar que existe el paciente
        const pacientesQuery = query(
          collection(db, 'users'),
          where('email', '==', userData.pacienteEmail),
          where('role', '==', 'paciente')
        );
        const pacienteSnapshot = await getDocs(pacientesQuery);
        
        if (pacienteSnapshot.empty) {
          throw new Error('No se encontró el paciente con ese correo');
        }

        const pacienteId = pacienteSnapshot.docs[0].id;

        // Crear el usuario familiar
        const familiarCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        
        // Guardar datos del familiar
        await setDoc(doc(db, 'users', familiarCredential.user.uid), {
          ...userData,
          role: 'familiar'
        });

        // Crear la relación familiar-paciente
        await addDoc(collection(db, 'relaciones'), {
          familiarId: familiarCredential.user.uid,
          pacienteId: pacienteId,
          tipo: 'familiar_paciente',
          createdAt: serverTimestamp()
        });

        return familiarCredential.user;
      }
      return null;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
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

      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        role: selectedRole,
        email: formData.email
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
        default:
          break;
      }

      if (selectedRole === 'familiar') {
        await handleRegister(selectedRole, { ...userData, password: formData.password });
      } else {
        await signup(formData.email, formData.password, selectedRole, userData);
      }

      navigate('/');
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
                <label>Parentesco</label>
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