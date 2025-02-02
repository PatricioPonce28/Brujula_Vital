import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import '../Componentes_css/DashboardAdministrador.css';
import LogoutButton from './LogoutButton';

const DashboardAdmin = () => {

  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detalleUsuario, setDetalleUsuario] = useState(null);

  // Cargar todos los usuarios y sus relaciones
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        // Verificar si el usuario tiene rol de admin
        if (currentUser?.role !== 'admin') {
          setError('Acceso no autorizado');
          return;
        }

        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        let usuariosData = [];

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const userId = userDoc.id;

          // Si es un paciente, buscar su familiar y doctor
          if (userData.role === 'paciente') {
            // Buscar familiar
            const relacionesRef = collection(db, 'relaciones');
            const relacionQuery = query(relacionesRef, where('pacienteId', '==', userId));
            const relacionSnapshot = await getDocs(relacionQuery);
            
            let familiarData = null;
            if (!relacionSnapshot.empty) {
              const familiarId = relacionSnapshot.docs[0].data().familiarId;
              const familiarDoc = await getDoc(doc(db, 'users', familiarId));
              if (familiarDoc.exists()) {
                familiarData = familiarDoc.data();
              }
            }

            // Buscar citas y doctor
            const citasRef = collection(db, 'citas');
            const citasQuery = query(citasRef, where('pacienteId', '==', userId));
            const citasSnapshot = await getDocs(citasQuery);
            const citas = citasSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              fecha: doc.data().fecha.toDate()
            }));

            usuariosData.push({
              id: userId,
              ...userData,
              familiar: familiarData,
              citas: citas
            });
          } else {
            usuariosData.push({
              id: userId,
              ...userData
            });
          }
        }

        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, [currentUser]);

  const eliminarUsuario = async (userId, role) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      
      // Si es un paciente, eliminar sus relaciones y citas
      if (role === 'paciente') {
        const relacionesRef = collection(db, 'relaciones');
        const relacionQuery = query(relacionesRef, where('pacienteId', '==', userId));
        const relacionSnapshot = await getDocs(relacionQuery);
        
        relacionSnapshot.docs.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        const citasRef = collection(db, 'citas');
        const citasQuery = query(citasRef, where('pacienteId', '==', userId));
        const citasSnapshot = await getDocs(citasQuery);
        
        citasSnapshot.docs.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      }

      setUsuarios(usuarios.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar el usuario');
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const cumpleFiltro = filtro === 'todos' || usuario.role === filtro;
    const cumpleBusqueda = 
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  if (!currentUser || currentUser.email !== 'admin@gmail.com') {
    return <div className="error-acceso">Acceso no autorizado</div>;
  }

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        
        <h1>Panel de Administración</h1>
        <p>Gestión de Usuarios y Registros</p>
      </div>

      <div className="controles">
        <div className="busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
        </div>

        <div className="filtros">
          <button
            className={`filtro-btn ${filtro === 'todos' ? 'activo' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos
          </button>
          <button
            className={`filtro-btn ${filtro === 'paciente' ? 'activo' : ''}`}
            onClick={() => setFiltro('paciente')}
          >
            Pacientes
          </button>
          <button
            className={`filtro-btn ${filtro === 'doctor' ? 'activo' : ''}`}
            onClick={() => setFiltro('doctor')}
          >
            Doctores
          </button>
          <button
            className={`filtro-btn ${filtro === 'familiar' ? 'activo' : ''}`}
            onClick={() => setFiltro('familiar')}
          >
            Familiares
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="usuarios-lista">
          {usuariosFiltrados.map(usuario => (
            <div key={usuario.id} className="usuario-card">
              <div className="usuario-info">
                <h3>{usuario.nombre} {usuario.apellido}</h3>
                <p className="email">{usuario.email}</p>
                <span className={`role-badge ${usuario.role}`}>
                  {usuario.role}
                </span>
              </div>

              {usuario.role === 'paciente' && (
                <div className="paciente-detalles">
                  <div className="detalles-grid">
                    <div className="detalle-item">
                      <h4>Familiar Asignado:</h4>
                      <p>{usuario.familiar ? 
                        `${usuario.familiar.nombre} ${usuario.familiar.apellido}` : 
                        'No asignado'}
                      </p>
                    </div>
                    <div className="detalle-item">
                      <h4>Última Cita:</h4>
                      <p>
                        {usuario.citas?.length > 0 ? 
                          usuario.citas[usuario.citas.length - 1].fecha.toLocaleDateString() :
                          'Sin citas'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="ver-detalles-btn"
                    onClick={() => setDetalleUsuario(usuario)}
                  >
                    Ver Detalles Completos
                  </button>
                </div>
              )}

              <button
                className="eliminar-btn"
                onClick={() => eliminarUsuario(usuario.id, usuario.role)}
              >
                Eliminar Usuario
              </button>
            </div>
          ))}
        </div>
      )}

      {detalleUsuario && (
        <div className="modal-detalles">
          <div className="modal-content">
            <h2>Detalles del Paciente</h2>
            <div className="detalles-content">
              <h3>Información Personal</h3>
              <p><strong>Nombre:</strong> {detalleUsuario.nombre} {detalleUsuario.apellido}</p>
              <p><strong>Email:</strong> {detalleUsuario.email}</p>

              <h3>Historial de Citas</h3>
              <div className="citas-lista">
                {detalleUsuario.citas?.map(cita => (
                  <div key={cita.id} className="cita-item">
                    <div className="cita-fecha">
                      {cita.fecha.toLocaleDateString()}
                    </div>
                    <div className={`cita-estado ${cita.estado}`}>
                      {cita.estado}
                    </div>
                  </div>
                ))}
              </div>

              <h3>Familiar Asignado</h3>
              {detalleUsuario.familiar ? (
                <div className="familiar-info">
                  <p><strong>Nombre:</strong> {detalleUsuario.familiar.nombre} {detalleUsuario.familiar.apellido}</p>
                  <p><strong>Email:</strong> {detalleUsuario.familiar.email}</p>
                </div>
              ) : (
                <p>No hay familiar asignado</p>
              )}
            </div>
            <button
              className="cerrar-btn"
              onClick={() => setDetalleUsuario(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default DashboardAdmin;