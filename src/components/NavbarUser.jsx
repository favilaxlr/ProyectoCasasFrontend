import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { IoPerson, IoChevronDownSharp, IoAlbumsOutline, IoBagOutline, IoLogOutOutline, IoCartOutline} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import Tooltip from '@mui/material/Tooltip';

function NavbarUser() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar my-3 flex justify-between py-5 px-10 rounded-lg shadow-lg">
       <Link to = '/properties'>
         <Logo size="medium" />
       </Link>
       <ul className="flex gap-x-2">
        <li>
        <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-blue-800 data-open:bg-blue-800">
          Propiedades
          <IoChevronDownSharp className="fill-white/60" size={30} />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          <MenuItem>
            <button onClick={ ()=>{navigate('/properties')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoBagOutline className="fill-white/30" size={30} />
              Ver Propiedades
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/profile')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoPerson className="fill-white/30" size={30} />
              Mi Perfil
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/my-appointments')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoCartOutline className="fill-white/30" size={30} />
              Mis Citas
            </button>
          </MenuItem>
          <div className="my-1 h-px bg-white/5" />
          <MenuItem>
            <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoLogOutOutline className="fill-white/30" size={30} />
              <Link to = '/'
                onClick={ ( ) => logOut( ) }
               >
                Salir
              </Link>
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
        </li>
        <li>

        </li>
        <li className='ml-2 flex items-center'>
          <IoPerson size={30}/> {user.username}
        </li>
       </ul>
    </nav>
  )
}

export default NavbarUser