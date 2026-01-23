import { createContext, useContext, useState, useEffect } from "react";
import { 
  getAppointmentsRequest,
  createAppointmentRequest,
  confirmAppointmentRequest,
  cancelAppointmentRequest
} from "../api/appointments";

const AppointmentContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAppointments = () => {
  const context = useContext(AppointmentContext);

  if (!context)
      throw new Error("useAppointments debe estar en un contexto")

  return context;
};

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [errors, setErrors] = useState([]);

  // Función para obtener todas las citas (admin)
  const getAppointments = async () => {
    try {
      const res = await getAppointmentsRequest();
      setAppointments(res.data);
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Función para crear una cita (público)
  const createAppointment = async (appointment) => {
    try {
      const res = await createAppointmentRequest(appointment);
      return res.data;
    } catch (error) {
      setErrors(error.response.data.message);
      throw error;
    }
  };

  // Función para confirmar una cita
  const confirmAppointment = async (confirmationCode) => {
    try {
      const res = await confirmAppointmentRequest(confirmationCode);
      return res.data;
    } catch (error) {
      setErrors(error.response.data.message);
      throw error;
    }
  };

  // Función para cancelar una cita
  const cancelAppointment = async (id) => {
    try {
      await cancelAppointmentRequest(id);
      getAppointments();
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Limpiar errores después de 5 segundos
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([])
      }, 5000)
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <AppointmentContext.Provider value={{ 
      appointments,
      getAppointments,
      createAppointment,
      confirmAppointment,
      cancelAppointment,
      errors
    }}>
      {children}
    </AppointmentContext.Provider>
  )
};