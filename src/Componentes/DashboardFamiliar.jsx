import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import '../Componentes_css/DashboardFamiliar.css';

const DashboardFamiliar = () => {
  const { currentUser } = useAuth();
  const [pacienteInfo, setPacienteInfo] = useState(null);
  const [progresoTratamiento, setProgresoTratamiento] = useState(0);
  const [citasHistorial, setCitasHistorial] = useState([]);
  const [notasDoctor, setNotasDoctor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatosPaciente = async () => {
      try {
        // Primero obtenemos la relación familiar-paciente
        const relacionesRef = collection(db, 'relaciones');
        const q = query(relacionesRef, 
          where('familiarId', '==', currentUser.uid)
        );
        const relacionSnapshot = await getDocs(q);

        if (relacionSnapshot.empty) {
          setError('No se encontró un paciente vinculado');
          setLoading(false);
          return;
        }

        const relacion = relacionSnapshot.docs[0].data();
        const pacienteId = relacion.pacienteId;

        // Obtener información del paciente
        const pacienteDoc = await getDoc(doc(db, 'users', pacienteId));
        if (pacienteDoc.exists()) {
          setPacienteInfo(pacienteDoc.data());
        }

        // Obtener citas del paciente
        const citasRef = collection(db, 'citas');
        const citasQuery = query(citasRef, where('pacienteId', '==', pacienteId));
        const citasSnapshot = await getDocs(citasQuery);
        const citas = citasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }));
        setCitasHistorial(citas);

        // Obtener notas del doctor
        const notasRef = collection(db, 'notas_pacientes');
        const notasQuery = query(notasRef, where('pacienteId', '==', pacienteId));
        const notasSnapshot = await getDocs(notasQuery);
        const notas = notasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }));
        setNotasDoctor(notas);

        // Calcular progreso basado en citas completadas
        const citasCompletadas = citas.filter(cita => cita.estado === 'completada').length;
        const progresoCalculado = (citasCompletadas / (citas.length || 1)) * 100;
        setProgresoTratamiento(progresoCalculado);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar la información del paciente');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosPaciente();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-familiar">
      <div className="dashboard-header">
        <h1>Portal Familiar</h1>
        <p>Seguimiento del paciente: {pacienteInfo?.nombre} {pacienteInfo?.apellido}</p>
      </div>

      <div className="dashboard-content">
        <div className="card progreso-card">
          <h2>Progreso del Tratamiento</h2>
          <div className="progreso-container">
            <div className="progreso-barra-container">
              <div 
                className="progreso-barra" 
                style={{ width: `${progresoTratamiento}%` }}
              />
            </div>
            <div className="progreso-texto">{Math.round(progresoTratamiento)}% completado</div>
          </div>

          <div className="estadisticas">
            <div className="estadistica-item">
              <h3>Total de Citas</h3>
              <p>{citasHistorial.length}</p>
            </div>
            <div className="estadistica-item">
              <h3>Citas Completadas</h3>
              <p>{citasHistorial.filter(cita => cita.estado === 'completada').length}</p>
            </div>
            <div className="estadistica-item">
              <h3>Próxima Cita</h3>
              <p>
                {citasHistorial
                  .filter(cita => cita.fecha > new Date())
                  .sort((a, b) => a.fecha - b.fecha)[0]?.fecha.toLocaleDateString() || 'No programada'}
              </p>
            </div>
          </div>
        </div>

        <div className="card notas-card">
          <h2>Notas del Doctor</h2>
          <div className="notas-list">
            {notasDoctor.length > 0 ? (
              notasDoctor
                .sort((a, b) => b.fecha - a.fecha)
                .map(nota => (
                  <div key={nota.id} className="nota-item">
                    <div className="nota-fecha">
                      {nota.fecha.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="nota-contenido">{nota.notas}</div>
                  </div>
                ))
            ) : (
              <p className="no-notas">No hay notas disponibles</p>
            )}
          </div>
        </div>

        <div className="card citas-card">
          <h2>Historial de Citas</h2>
          <div className="citas-list">
            {citasHistorial.length > 0 ? (
              citasHistorial
                .sort((a, b) => b.fecha - a.fecha)
                .map(cita => (
                  <div key={cita.id} className="cita-item">
                    <div className="cita-fecha">
                      {cita.fecha.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className={`cita-estado ${cita.estado}`}>
                      {cita.estado}
                    </div>
                  </div>
                ))
            ) : (
              <p className="no-citas">No hay citas registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFamiliar;