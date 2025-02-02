import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Componentes_css/DashboardPaciente.css';

const PacienteDashboard = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [misCitas, setMisCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [horasDisponibles, setHorasDisponibles] = useState([
    '09:00', '10:00', '11:00', '12:00', 
    '14:00', '15:00', '16:00', '17:00'
  ]);

  // Cargar citas del paciente
  useEffect(() => {
    const cargarCitas = async () => {
      try {
        const citasRef = collection(db, 'citas');
        const q = query(citasRef, where('pacienteId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const citasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        }));

        setMisCitas(citasData);
      } catch (error) {
        console.error('Error al cargar citas:', error);
        setMensaje('Error al cargar tus citas');
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [currentUser]);

  // Verificar disponibilidad
  const verificarDisponibilidad = async (fecha, hora) => {
    try {
      const citasRef = collection(db, 'citas');
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(parseInt(hora.split(':')[0]), 0, 0, 0);
      
      const q = query(citasRef, where('fecha', '==', Timestamp.fromDate(fechaInicio)));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  };

  // Agendar cita
  const agendarCita = async () => {
    if (!selectedDate || !selectedTime) {
      setMensaje('Por favor selecciona fecha y hora');
      return;
    }

    try {
      const fechaCita = new Date(selectedDate);
      fechaCita.setHours(parseInt(selectedTime.split(':')[0]), 0, 0, 0);

      const disponible = await verificarDisponibilidad(selectedDate, selectedTime);
      
      if (!disponible) {
        setMensaje('Este horario ya no está disponible');
        return;
      }

      const citaData = {
        pacienteId: currentUser.uid,
        pacienteNombre: currentUser.nombre,
        fecha: Timestamp.fromDate(fechaCita),
        estado: 'pendiente',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'citas'), citaData);
      setMensaje('Cita agendada exitosamente');
      
      // Actualizar lista de citas
      const nuevaCita = {
        ...citaData,
        fecha: fechaCita,
        id: Date.now().toString()
      };
      setMisCitas([...misCitas, nuevaCita]);
      
    } catch (error) {
      console.error('Error al agendar cita:', error);
      setMensaje('Error al agendar la cita');
    }
  };

  return (
    <div className="paciente-dashboard">
      <header className="dashboard-header">
        <h1>Bienvenido, {currentUser?.nombre}</h1>
      </header>

      <div className="dashboard-content">
        <div className="agendar-cita-section">
          <h2>Agendar Nueva Cita</h2>
          <div className="calendar-container">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              className="calendar"
            />
          </div>

          <div className="horarios-container">
            <h3>Horarios Disponibles</h3>
            <div className="horarios-grid">
              {horasDisponibles.map((hora) => (
                <button
                  key={hora}
                  className={`hora-btn ${selectedTime === hora ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(hora)}
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="agendar-btn"
            onClick={agendarCita}
          >
            Agendar Cita
          </button>

          {mensaje && (
            <div className={`mensaje ${mensaje.includes('Error') ? 'error' : 'success'}`}>
              {mensaje}
            </div>
          )}
        </div>

        <div className="mis-citas-section">
          <h2>Mis Citas</h2>
          {loading ? (
            <p>Cargando citas...</p>
          ) : misCitas.length > 0 ? (
            <div className="citas-list">
              {misCitas.map((cita) => (
                <div key={cita.id} className="cita-card">
                  <div className="cita-fecha">
                    {cita.fecha.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="cita-hora">
                    {cita.fecha.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className={`cita-estado ${cita.estado}`}>
                    {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No tienes citas programadas</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PacienteDashboard;