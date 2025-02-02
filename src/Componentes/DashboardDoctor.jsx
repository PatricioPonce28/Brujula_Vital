import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  addDoc
} from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Componentes_css/DashboardDoctor.css';

const DashboardDoctor = () => {
  const { currentUser } = useAuth();
  const [citas, setCitas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [citasDelDia, setCitasDelDia] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  // Cargar todas las citas
  useEffect(() => {
    const cargarCitas = async () => {
      try {
        const citasRef = collection(db, 'citas');
        const querySnapshot = await getDocs(citasRef);
        
        const citasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }));

        setCitas(citasData);
        filtrarCitasDelDia(citasData, selectedDate);
      } catch (error) {
        console.error('Error al cargar citas:', error);
        setMensaje('Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, []);

  // Filtrar citas del día seleccionado
  const filtrarCitasDelDia = (todasLasCitas, fecha) => {
    const citasFiltradas = todasLasCitas.filter(cita => {
      const citaFecha = cita.fecha;
      return citaFecha.getDate() === fecha.getDate() &&
             citaFecha.getMonth() === fecha.getMonth() &&
             citaFecha.getFullYear() === fecha.getFullYear();
    });
    setCitasDelDia(citasFiltradas);
  };

  // Manejar cambio de fecha en el calendario
  const handleDateChange = (date) => {
    setSelectedDate(date);
    filtrarCitasDelDia(citas, date);
  };

  // Actualizar estado de la cita
  const actualizarEstadoCita = async (citaId, nuevoEstado) => {
    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, {
        estado: nuevoEstado
      });

      // Actualizar estado local
      const citasActualizadas = citas.map(cita => 
        cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita
      );
      setCitas(citasActualizadas);
      filtrarCitasDelDia(citasActualizadas, selectedDate);
      setMensaje(`Cita ${nuevoEstado} exitosamente`);
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      setMensaje('Error al actualizar el estado de la cita');
    }
  };

  // Guardar notas del paciente
  const guardarNotas = async () => {
    if (!selectedCita || !notas.trim()) return;

    try {
      await addDoc(collection(db, 'notas_pacientes'), {
        citaId: selectedCita.id,
        pacienteId: selectedCita.pacienteId,
        doctorId: currentUser.uid,
        notas: notas,
        fecha: new Date(),
      });

      setMensaje('Notas guardadas exitosamente');
      setNotas('');
      setSelectedCita(null);
    } catch (error) {
      console.error('Error al guardar notas:', error);
      setMensaje('Error al guardar las notas');
    }
  };

  return (
    <div className="dashboard-doctor">
      <div className="dashboard-header">
        <div className="doctor-info">
          <h1>Dr. {currentUser?.nombre}</h1>
          <p className="especialidad">{currentUser?.especialidad}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="calendario-section">
          <div className="card">
            <h2>Calendario de Citas</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="doctor-calendar"
            />
          </div>
        </div>

        <div className="citas-section">
          <div className="card">
            <h2>Citas del Día</h2>
            <div className="fecha-seleccionada">
              {selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {loading ? (
              <div className="loading">Cargando citas...</div>
            ) : citasDelDia.length > 0 ? (
              <div className="lista-citas">
                {citasDelDia.map((cita) => (
                  <div key={cita.id} className="cita-card">
                    <div className="cita-info">
                      <div className="paciente-nombre">
                        Paciente: {cita.pacienteNombre}
                      </div>
                      <div className="cita-hora">
                        Hora: {cita.fecha.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className={`cita-estado ${cita.estado}`}>
                        Estado: {cita.estado}
                      </div>
                    </div>
                    
                    <div className="cita-acciones">
                      <button
                        className="btn-confirmar"
                        onClick={() => actualizarEstadoCita(cita.id, 'confirmada')}
                      >
                        Confirmar
                      </button>
                      <button
                        className="btn-cancelar"
                        onClick={() => actualizarEstadoCita(cita.id, 'cancelada')}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn-notas"
                        onClick={() => setSelectedCita(cita)}
                      >
                        Agregar Notas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-citas">
                No hay citas programadas para este día
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCita && (
        <div className="modal-notas">
          <div className="modal-content">
            <h3>Notas para {selectedCita.pacienteNombre}</h3>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escriba sus notas aquí..."
            />
            <div className="modal-actions">
              <button onClick={guardarNotas} className="btn-guardar">
                Guardar Notas
              </button>
              <button 
                onClick={() => {
                  setSelectedCita(null);
                  setNotas('');
                }} 
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('Error') ? 'error' : 'success'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default DashboardDoctor;