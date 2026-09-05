import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";
import Logo from "./Logo";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoPersonAdd, IoLogIn, IoMenu, IoClose, IoEyeOutline, IoPricetagOutline } from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import SellHomeLink from './SellHomeLink';

function Navbar() {
    const { isAuthenticated, isAdmin, isCoAdmin} = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    if (isAuthenticated && (isAdmin || isCoAdmin))
        return <NavbarAdmin />
    else 
        if (isAuthenticated)
            return <NavbarUser/>
    
  return (
    <nav className="navbar flex flex-col lg:flex-row justify-between items-center py-3 md:py-6 px-4 md:px-6 lg:px-10 shadow-2xl backdrop-blur-sm relative z-[10000] rounded-none">
      {/* Contenedor para móvil y tablet */}
      <div className="flex lg:hidden justify-center items-center w-full relative min-h-10">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="text-white p-2 hover:bg-white/15 rounded-xl transition-colors absolute left-0 z-10"
        >
          {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
        </button>

        <Link to='/' className="hover:scale-105 transition-transform duration-300">
          <Logo size="small" className="md:h-10" />
        </Link>

        <SellHomeLink
          variant="icon"
          className="absolute right-0 z-10 w-10 h-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Logo centrado en desktop grande - posición absoluta */}
      <Link to='/' className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 hover:scale-105 transition-transform duration-300">
        <Logo size="medium" />
      </Link>
      
      {/* Desktop Menu - alineado a la derecha */}
      <div className="hidden lg:flex flex-row items-center space-x-4 xl:space-x-8 ml-auto">
        <Link 
          to='/properties' 
          className="flex items-center gap-2 text-white hover:text-[var(--gold-accent)] font-medium text-base xl:text-lg transition-all duration-300 hover:scale-105 relative group whitespace-nowrap"
        >
          <IoEyeOutline size={20} />
          View Properties
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--gold-accent)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link 
          to='/sell' 
          className="flex items-center gap-2 text-white hover:text-[var(--gold-accent)] font-medium text-base xl:text-lg transition-all duration-300 hover:scale-105 relative group whitespace-nowrap"
        >
          <IoPricetagOutline size={20} />
          Sell Your Home
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--gold-accent)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <div className="flex items-center space-x-2 xl:space-x-3">
          <Tooltip title="Sign In" arrow>
            <Link 
              to='/login'
              className="flex items-center space-x-1 xl:space-x-2 btn-primary px-4 xl:px-6 py-2.5 xl:py-3 rounded-none font-semibold text-sm xl:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap"
            >
              <IoLogIn size={18} className="xl:w-5 xl:h-5" />
              <span>Sign In</span>
            </Link>
          </Tooltip>
          
          <Tooltip title="Register" arrow>
            <Link 
              to='/register'
              className="flex items-center space-x-1 xl:space-x-2 btn-secondary px-4 xl:px-6 py-2.5 xl:py-3 rounded-none font-semibold text-sm xl:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap"
            >
              <IoPersonAdd size={18} className="xl:w-5 xl:h-5" />
              <span>Register</span>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full mt-4 space-y-3 animate-fade-in border-t border-white/20 pt-4 rounded-none">
          <Link 
            to='/properties'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-white hover:text-[var(--gold-accent)] font-medium text-base transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/10"
          >
            <IoEyeOutline size={20} />
            <span>View Properties</span>
          </Link>
          <Link 
            to='/sell'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-white hover:text-[var(--gold-accent)] font-medium text-base transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/10"
          >
            <IoPricetagOutline size={20} />
            <span>Sell Your Home</span>
          </Link>
          
          <Link 
            to='/login'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 btn-primary w-full py-3 rounded-none font-semibold transition-all duration-300"
          >
            <IoLogIn size={20} />
            <span>Sign In</span>
          </Link>
          
          <Link 
            to='/register'
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 btn-secondary w-full py-3 rounded-none font-semibold transition-all duration-300"
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