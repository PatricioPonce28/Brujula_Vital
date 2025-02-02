import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../Componentes_css/Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!selectedRole) {
      setError('Por favor seleccione un rol');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Intentar login
      const userCredential = await login(formData.email, formData.password);
      
      // Verificar el rol del usuario en Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();

      if (!userData || userData.role !== selectedRole) {
        setError(`Credenciales incorrectas para el rol de ${selectedRole}`);
        return;
      }

      // Redireccionar según el rol
      switch (selectedRole) {
        case 'paciente':
          navigate('/paciente-dashboard');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'familiar':
          navigate('/familiar-dashboard');
          break;
          case 'admin':
            if (userData.role === 'admin') {  
                navigate('/admin-dashboard');
            } else {
                setError('No tienes permisos de administrador');
            }
            break;
        default:
          navigate('/');
      }
    } catch (error) {
      setError('Error al iniciar sesión: credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Iniciar Sesión</h2>
        
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
            <button
              type="button"
              className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('admin')}
            >
              Administrador
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="********"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;