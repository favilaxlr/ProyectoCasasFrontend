import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";
import Logo from "./Logo";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoPersonAdd, IoLogIn } from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';

function Navbar() {
    const { isAuthenticated, isAdmin} = useAuth();
    
    if (isAuthenticated && isAdmin)
        return <NavbarAdmin /> //. /addproducts /updateProduct
    else 
        if (isAuthenticated)
            return <NavbarUser/>
    
  return (
    <nav className="navbar my-3 flex justify-between items-center py-6 px-10 rounded-xl shadow-2xl backdrop-blur-sm">
      <Link to='/' className="hover:scale-105 transition-transform duration-300">
        <Logo size="medium" />
      </Link>
      
      <div className="flex items-center space-x-8">
        <Link 
          to='/properties' 
          className="text-white hover:text-[var(--gold-accent)] font-medium text-lg transition-all duration-300 hover:scale-105 relative group"
        >
          Ver Propiedades
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--gold-accent)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <Tooltip title="Iniciar Sesión" arrow>
            <Link 
              to='/login'
              className="flex items-center space-x-2 btn-primary px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <IoLogIn size={20} />
              <span>Iniciar Sesión</span>
            </Link>
          </Tooltip>
          
          <Tooltip title="Registrarse" arrow>
            <Link 
              to='/register'
              className="flex items-center space-x-2 btn-secondary px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <IoPersonAdd size={20} />
              <span>Registrarse</span>
            </Link>
          </Tooltip>
        </div>
      </div>
    </nav>
  )
}

export default Navbar