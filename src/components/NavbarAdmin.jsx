import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { IoPerson, IoLogOut, IoChevronDownSharp, IoBagAdd, IoBagSharp} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';

function NavbarAdmin() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar my-3 flex justify-between py-5 px-10 rounded-lg shadow-lg">
       <Link to = '/admin/properties'>
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
            <button onClick={ ()=>{navigate('/admin/properties')}}
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoBagSharp className="fill-white/30" size={30} />
              Listar Propiedades
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/admin/add-property')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoBagAdd className="fill-white/30" size={30} />
              Agregar Propiedad
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={ ()=>{navigate('/admin/appointments')}} 
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoBagSharp className="fill-white/30" size={30} />
              Ver Citas
            </button>
          </MenuItem>
          {user.role?.role === 'admin' && (
            <MenuItem>
              <button onClick={ ()=>{navigate('/admin/users')}} 
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                <IoPerson className="fill-white/30" size={30} />
                Gestionar Usuarios
              </button>
            </MenuItem>
          )}
          <div className="my-1 h-px bg-white/5" />
          <MenuItem>
            <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <IoLogOut className="fill-white/30" size={30} />
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
        <li className='ml-2 flex mx-3 px-3'>
          <IoPerson size={30}/> {user.username}
        </li>
       </ul>
    </nav>
  )
}

export default NavbarAdmin