import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";
import Logo from "./Logo";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoPersonAdd, IoLogIn } from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';

function Navbar() {
    const { isAuthenticated, isAdmin, isCoAdmin} = useAuth();
    
    if (isAuthenticated && (isAdmin || isCoAdmin))
        return <NavbarAdmin />
    else 
        if (isAuthenticated)
            return <NavbarUser/>
    
  return (
    <nav className="navbar my-3 mx-3 flex flex-col md:flex-row justify-between items-center py-4 md:py-6 px-4 md:px-10 rounded-xl shadow-2xl backdrop-blur-sm gap-4 md:gap-0">
      <Link to='/' className="hover:scale-105 transition-transform duration-300">
        <Logo size="small" className="md:size-medium" />
      </Link>
      
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
        <Link 
          to='/properties' 
          className="text-white hover:text-[var(--gold-accent)] font-medium text-base md:text-lg transition-all duration-300 hover:scale-105 relative group"
        >
          View Properties
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--gold-accent)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
          <Tooltip title="Sign In" arrow>
            <Link 
              to='/login'
              className="flex items-center space-x-2 btn-primary px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm md:text-base"
            >
              <IoLogIn size={18} className="md:w-5 md:h-5" />
              <span>Sign In</span>
            </Link>
          </Tooltip>
          
          <Tooltip title="Register" arrow>
            <Link 
              to='/register'
              className="flex items-center space-x-2 btn-secondary px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm md:text-base"
            >
              <IoPersonAdd size={18} className="md:w-5 md:h-5" />
              <span>Register</span>
            </Link>
          </Tooltip>
        </div>
      </div>
    </nav>
  )
}

export default Navbar