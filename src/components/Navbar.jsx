import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";
import Logo from "./Logo";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoPersonAdd, IoLogIn, IoMenu, IoClose, IoHomeSharp } from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

function Navbar() {
    const { isAuthenticated, isAdmin, isCoAdmin} = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    if (isAuthenticated && (isAdmin || isCoAdmin))
        return <NavbarAdmin />
    else 
        if (isAuthenticated)
            return <NavbarUser/>
    
  return (
    <nav className="navbar my-2 mx-2 md:my-3 md:mx-3 flex flex-col md:flex-row justify-between items-center py-3 md:py-6 px-4 md:px-10 rounded-xl shadow-2xl backdrop-blur-sm relative">
      <div className="flex justify-between items-center w-full md:w-auto gap-4">
        {/* Logo como botón */}
        <Link to='/' className="hover:scale-105 transition-transform duration-300">
          <Logo size="medium" />
        </Link>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
        </button>
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex flex-row items-center space-x-8">
        <Link 
          to='/properties' 
          className="text-white hover:text-[var(--gold-accent)] font-medium text-lg transition-all duration-300 hover:scale-105 relative group"
        >
          View Properties
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--gold-accent)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <Tooltip title="Sign In" arrow>
            <Link 
              to='/login'
              className="flex items-center space-x-2 btn-primary px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <IoLogIn size={20} />
              <span>Sign In</span>
            </Link>
          </Tooltip>
          
          <Tooltip title="Register" arrow>
            <Link 
              to='/register'
              className="flex items-center space-x-2 btn-secondary px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <IoPersonAdd size={20} />
              <span>Register</span>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full mt-4 space-y-3 animate-fade-in border-t border-white/20 pt-4">
          <Link 
            to='/properties'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-white hover:text-[var(--gold-accent)] font-medium text-base transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/10"
          >
            <IoHomeSharp size={20} />
            <span>View Properties</span>
          </Link>
          
          <Link 
            to='/login'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 btn-primary w-full py-3 rounded-xl font-semibold transition-all duration-300"
          >
            <IoLogIn size={20} />
            <span>Sign In</span>
          </Link>
          
          <Link 
            to='/register'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 btn-secondary w-full py-3 rounded-xl font-semibold transition-all duration-300"
          >
            <IoPersonAdd size={20} />
            <span>Register</span>
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar