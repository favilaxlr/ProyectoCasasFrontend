import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { IoPerson, IoChevronDownSharp, IoBagOutline, IoLogOutOutline, IoCartOutline} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';

function NavbarUser() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar my-3 mx-3 flex justify-between items-center py-5 px-10 rounded-lg shadow-lg bg-gradient-to-r from-gray-900 to-gray-800">
       <Link to='/' className="hover:scale-105 transition-transform duration-300">
         <Logo size="medium" />
       </Link>
       <ul className="flex gap-x-4 items-center">
        <li>
        <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-white/10 transition-all">
          Propiedades
          <IoChevronDownSharp className="fill-white/60" size={20} />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-800 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 shadow-lg"
        >
          <MenuItem>
            <button onClick={ ()=>{navigate('/properties')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoBagOutline className="text-gray-500" size={20} />
              Ver Propiedades
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/my-appointments')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoCartOutline className="text-gray-500" size={20} />
              Mis Citas
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
        </li>
        
        <li>
        <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-white/10 transition-all">
          <IoPerson size={20}/> {user.username}
          <IoChevronDownSharp className="fill-white/60" size={16} />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-800 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 shadow-lg"
        >
          <MenuItem>
            <button onClick={ ()=>{navigate('/profile')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100">
              <IoPerson className="text-gray-500" size={20} />
              Mi Perfil
            </button>
          </MenuItem>
          <div className="my-1 h-px bg-gray-200" />
          <MenuItem>
            <button onClick={ () => { logOut(); navigate('/'); }} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-red-700 hover:bg-red-50 data-focus:bg-red-50">
              <IoLogOutOutline className="text-red-500" size={20} />
              Cerrar Sesión
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
        </li>
       </ul>
    </nav>
  )
}

export default NavbarUser