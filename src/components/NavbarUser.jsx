import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { IoPerson, IoChevronDownSharp, IoBagOutline, IoLogOutOutline, IoCartOutline, IoCashOutline, IoMenu, IoClose, IoPricetagOutline} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import { useState, useEffect } from 'react';
import { getUserOffersRequest } from '../api/offers';
import CitySelectionReminder from './CitySelectionReminder';

function NavbarUser() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  const [myOffersCount, setMyOffersCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Obtener el conteo de ofertas del usuario
  useEffect(() => {
    const fetchMyOffers = async () => {
      try {
        const res = await getUserOffersRequest();
        // Contar ofertas con respuestas nuevas (in_progress)
        const activeOffers = res.data.filter(offer => 
          offer.status === 'in_progress' || offer.status === 'pending'
        );
        setMyOffersCount(activeOffers.length);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchMyOffers();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchMyOffers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <nav className="navbar relative flex justify-between items-center py-3 px-4 md:my-3 md:mx-3 md:py-5 md:px-10 shadow-[0_25px_60px_rgba(3,8,24,0.65)] backdrop-blur-2xl border border-white/10 sticky top-0 z-[10000]">
       <button
         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
         aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
         className="md:hidden text-white p-2 hover:bg-white/15 rounded-xl transition-colors absolute left-4 z-10"
       >
         {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
       </button>
       <Link to='/' className="hover:scale-105 transition-transform duration-300 mx-auto md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
         <Logo size="small" className="md:size-medium" />
       </Link>
       
       {/* Desktop Menu */}
       <ul className="hidden md:flex gap-x-4 items-center ml-auto">
        <li>
        <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white/90 bg-white/10 border border-white/10 hover:border-white/40 hover:bg-white/20 transition-all backdrop-blur-sm">
          Properties
          <IoChevronDownSharp className="fill-white/60" size={20} />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-56 origin-top-right rounded-3xl border border-white/20 bg-[var(--glass-white)] backdrop-blur-xl p-2 text-sm/6 text-gray-800 transition duration-150 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 shadow-[0_25px_70px_rgba(3,8,24,0.4)]"
          style={{ zIndex: 10001 }}
        >
          <MenuItem>
            <button onClick={ ()=>{navigate('/properties')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoBagOutline className="text-gray-500" size={20} />
              View Properties
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/sell')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoPricetagOutline className="text-gray-500" size={20} />
              Sell Your Home
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/my-appointments')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoCartOutline className="text-gray-500" size={20} />
              My Appointments
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/my-offers')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoCashOutline className="text-gray-500" size={20} />
              My Offers
              {myOffersCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {myOffersCount}
                </span>
              )}
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
        </li>
        
        <li>
        <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-[var(--soft-black)] bg-gradient-to-r from-[var(--gold-accent)] via-[var(--electric-sky)] to-[var(--hyper-pink)] shadow-[0_10px_30px_rgba(3,8,24,0.35)] hover:shadow-[0_16px_40px_rgba(3,8,24,0.45)] transition-all">
          <IoPerson size={20}/> {user.username}
          <IoChevronDownSharp className="text-[var(--soft-black)]/70" size={16} />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-3xl border border-white/20 bg-[var(--glass-white)] backdrop-blur-xl p-2 text-sm/6 text-gray-800 transition duration-150 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 shadow-[0_25px_70px_rgba(3,8,24,0.4)]"
          style={{ zIndex: 10001 }}
        >
          <MenuItem>
            <button onClick={ ()=>{navigate('/profile')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoPerson className="text-gray-500" size={20} />
              My Profile
            </button>
          </MenuItem>
          <div className="my-1 h-px bg-gray-200" />
          <MenuItem>
            <button onClick={ () => { logOut(); navigate('/'); }} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-red-700 hover:bg-red-50 data-focus:bg-red-50">
              <IoLogOutOutline className="text-red-500" size={20} />
              Log Out
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
        </li>
       </ul>


       {/* Mobile Menu */}
       {mobileMenuOpen && (
         <div className="fixed top-[70px] right-2 w-[calc(100vw-16px)] max-w-sm bg-gradient-to-br from-[var(--soft-black)] via-[#041326] to-[var(--deep-teal)] text-white rounded-3xl shadow-[0_25px_60px_rgba(3,8,24,0.7)] border border-white/10 md:hidden z-[10001] overflow-hidden animate-fade-in max-h-[calc(100vh-80px)] overflow-y-auto">
           <div className="p-4 space-y-2">
             <button
               onClick={() => { navigate('/properties'); setMobileMenuOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
             >
               <IoBagOutline size={20} className="text-[var(--electric-sky)]" />
               <span className="font-medium">View Properties</span>
             </button>

             <button
               onClick={() => { navigate('/sell'); setMobileMenuOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
             >
               <IoPricetagOutline size={20} className="text-[var(--citrus-lime)]" />
               <span className="font-medium">Sell Your Home</span>
             </button>
             
             <button
               onClick={() => { navigate('/my-appointments'); setMobileMenuOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
             >
               <IoCartOutline size={20} className="text-[var(--citrus-lime)]" />
               <span className="font-medium">My Appointments</span>
             </button>
             
             <button
               onClick={() => { navigate('/my-offers'); setMobileMenuOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 rounded-2xl transition-colors relative"
             >
               <IoCashOutline size={20} className="text-[var(--hyper-pink)]" />
               <span className="font-medium">My Offers</span>
               {myOffersCount > 0 && (
                 <span className="ml-auto bg-white text-[var(--soft-black)] text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                   {myOffersCount}
                 </span>
               )}
             </button>

             <div className="my-2 h-px bg-white/15" />

             <button
               onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
             >
               <IoPerson size={20} className="text-[var(--electric-sky)]" />
               <span className="font-medium">My Profile</span>
             </button>

             <button
               onClick={() => { logOut(); navigate('/'); setMobileMenuOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-2xl transition-colors"
             >
               <IoLogOutOutline size={20} className="text-[var(--hyper-pink)]" />
               <span className="font-medium">Log Out</span>
             </button>
           </div>
         </div>
       )}
    </nav>
    <CitySelectionReminder />
    </>
  )
}

export default NavbarUser