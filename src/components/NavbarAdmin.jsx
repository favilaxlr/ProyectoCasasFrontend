import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { IoPerson, IoLogOutOutline, IoChevronDownSharp, IoBagAdd, IoHomeSharp, IoCalendarSharp, IoChatbubblesSharp, IoPeopleSharp, IoSettingsSharp} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';

function NavbarAdmin() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm" style={{ zIndex: 10000 }}>
      <div className="w-full px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to='/' className="hover:scale-105 transition-transform duration-300">
            <Logo size="medium" />
          </Link>

          {/* Navigation Items */}
          <ul className="flex gap-3 items-center">
            {/* Propiedades Menu */}
            <li className="relative">
              <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] transition-all duration-200 border border-transparent hover:border-[var(--gold-accent)]/30">
                  <IoHomeSharp size={18}/>
                  Propiedades
                  <IoChevronDownSharp className="fill-current" size={14} />
                </MenuButton>

                <MenuItems
                  modal
                  transition
                  className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-2 text-sm shadow-2xl transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  style={{ zIndex: 9999 }}
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gestión</p>
                  </div>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/properties')}}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <IoHomeSharp className="text-blue-600 dark:text-blue-400" size={16} />
                      </div>
                      <span className="font-medium">Listar Propiedades</span>
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/add-property')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                        <IoBagAdd className="text-green-600 dark:text-green-400" size={16} />
                      </div>
                      <span className="font-medium">Agregar Propiedad</span>
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/appointments')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                        <IoCalendarSharp className="text-purple-600 dark:text-purple-400" size={16} />
                      </div>
                      <span className="font-medium">Ver Citas</span>
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/notifications')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                        <IoChatbubblesSharp className="text-orange-600 dark:text-orange-400" size={16} />
                      </div>
                      <span className="font-medium">Notificaciones SMS</span>
                    </button>
                  </MenuItem>
                  
                  {user.role?.role === 'admin' && (
                    <>
                      <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
                      <MenuItem>
                        <button onClick={ ()=>{navigate('/admin/users')}} 
                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                            <IoPeopleSharp className="text-red-600 dark:text-red-400" size={16} />
                          </div>
                          <span className="font-medium">Gestionar Usuarios</span>
                        </button>
                      </MenuItem>
                    </>
                  )}
                </MenuItems>
              </Menu>
            </li>
            
            {/* Theme Toggle */}
            <li>
              <ThemeToggle />
            </li>
            
            {/* User Menu */}
            <li className="relative">
              <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-[var(--gold-accent)] to-amber-500 text-white hover:shadow-lg hover:shadow-[var(--gold-accent)]/30 transition-all duration-200">
                  <IoPerson size={18}/> 
                  {user.username}
                  <IoChevronDownSharp className="fill-white" size={14} />
                </MenuButton>

                <MenuItems
                  modal
                  transition
                  className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-2 text-sm shadow-2xl transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  style={{ zIndex: 9999 }}
                >
                  <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                  </div>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/profile')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 data-focus:bg-gray-100 transition-all">
                      <IoSettingsSharp className="text-gray-500 group-hover:text-[var(--gold-accent)]" size={18} />
                      <span className="font-medium">Mi Perfil</span>
                    </button>
                  </MenuItem>
                  
                  <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                  
                  <MenuItem>
                    <button onClick={ () => { logOut(); navigate('/'); }} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 data-focus:bg-red-50 transition-all">
                      <IoLogOutOutline className="text-red-500" size={18} />
                      <span className="font-semibold">Cerrar Sesión</span>
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavbarAdmin