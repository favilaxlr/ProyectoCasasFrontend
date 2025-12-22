import { createContext, useContext, useState, useEffect } from "react";
import { 
  getPropertiesRequest, 
  getAllPropertiesRequest,
  createPropertyRequest,
  deletePropertyRequest,
  getPropertyRequest,
  updatePropertyRequest
} from "../api/properties";

const PropertyContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useProperties = () => {
  const context = useContext(PropertyContext);

  if (!context)
      throw new Error("useProperties debe estar en un contexto")

  return context;
};

export function PropertiesProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [errors, setErrors] = useState([]);

  // Función para obtener propiedades del admin
  const getProperties = async () => {
    try {
      const res = await getPropertiesRequest();
      setProperties(res.data);
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Función para obtener todas las propiedades públicas
  const getAllProperties = async () => {
    try {
      const res = await getAllPropertiesRequest();
      setProperties(res.data);
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Función para crear una propiedad
  const createProperty = async (property) => {
    try {
      await createPropertyRequest(property);
      getProperties();
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Función para eliminar una propiedad
  const deleteProperty = async (id) => {
    try {
      await deletePropertyRequest(id);
      getProperties();
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Función para obtener una propiedad por ID
  const getPropertyById = async (id) => {
    try {
      const res = await getPropertyRequest(id);
      return res.data;
    } catch (error) {
      setErrors(error.response.data.message);
    }
  };

  // Función para actualizar una propiedad
  const updateProperty = async (id, property) => {
    try {
      await updatePropertyRequest(id, property);
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
    <PropertyContext.Provider value={{ 
      properties,
      getAllProperties,
      getProperties,
      createProperty,
      deleteProperty,
      getPropertyById,
      updateProperty,
      errors
    }}>
      {children}
    </PropertyContext.Provider>
  )
};