import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { IoPerson, IoLogOutOutline, IoChevronDownSharp, IoBagAdd, IoHomeSharp, IoCalendarSharp, IoChatbubblesSharp, IoPeopleSharp, IoSettingsSharp, IoCashSharp, IoMenu, IoClose} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import { useNotificationCount } from '../hooks/useNotificationCount';
import { useState } from 'react';

function NavbarAdmin() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  const { pendingOffersCount } = useNotificationCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 backdrop-blur-lg bg-white/95 border-b border-gray-200 shadow-sm" style={{ zIndex: 10000 }}>
      <div className="w-full px-3 md:px-6 py-3 md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to='/' className="hover:scale-105 transition-transform duration-300">
            <Logo size="small" className="md:size-medium" />
          </Link>

          {/* Desktop Navigation Items */}
          <ul className="hidden lg:flex gap-3 items-center">
            {/* Propiedades Menu */}
            <li className="relative">
              <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] transition-all duration-200 border border-transparent hover:border-[var(--gold-accent)]/30">
                  <IoHomeSharp size={18}/>
                  Properties
                  <IoChevronDownSharp className="fill-current" size={14} />
                </MenuButton>

                <MenuItems
                  modal
                  transition
                  className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-gray-200 bg-white p-2 text-sm shadow-2xl transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  style={{ zIndex: 9999 }}
                >
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Management</p>
                  </div>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/properties')}}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <IoHomeSharp className="text-blue-600" size={16} />
                      </div>
                      <span className="font-medium">List Properties</span>
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/add-property')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                        <IoBagAdd className="text-green-600" size={16} />
                      </div>
                      <span className="font-medium">Add Property</span>
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/appointments')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        <IoCalendarSharp className="text-purple-600" size={16} />
                      </div>
                      <span className="font-medium">View Appointments</span>
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/offers')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                        <IoCashSharp className="text-green-600" size={16} />
                      </div>
                      <span className="font-medium">Manage Offers</span>
                      {pendingOffersCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {pendingOffersCount}
                        </span>
                      )}
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/notifications')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
                        <IoChatbubblesSharp className="text-orange-600" size={16} />
                      </div>
                      <span className="font-medium">SMS Notifications</span>
                    </button>
                  </MenuItem>
                  
                  {user.role?.role === 'admin' && (
                    <>
                      <div className="my-2 h-px bg-gray-200" />
                      <MenuItem>
                        <button onClick={ ()=>{navigate('/admin/users')}} 
                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                          <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                            <IoPeopleSharp className="text-red-600" size={16} />
                          </div>
                          <span className="font-medium">Manage Users</span>
                        </button>
                      </MenuItem>
                    </>
                  )}
                </MenuItems>
              </Menu>
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
                  className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-gray-200 bg-white p-2 text-sm shadow-2xl transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  style={{ zIndex: 9999 }}
                >
                  <div className="px-3 py-3 border-b border-gray-100 mb-1">
                    <p className="text-xs font-semibold text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/profile')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-gray-100 data-focus:bg-gray-100 transition-all">
                      <IoSettingsSharp className="text-gray-500 group-hover:text-[var(--gold-accent)]" size={18} />
                      <span className="font-medium">My Profile</span>
                    </button>
                  </MenuItem>
                  
                  <div className="my-1 h-px bg-gray-200" />
                  
                  <MenuItem>
                    <button onClick={ () => { logOut(); navigate('/'); }} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 data-focus:bg-red-50 transition-all">
                      <IoLogOutOutline className="text-red-500" size={18} />
                      <span className="font-semibold">Log Out</span>
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-[70px] left-2 right-2 bg-white rounded-xl shadow-2xl border border-gray-200 lg:hidden z-[9999] max-h-[calc(100vh-80px)] overflow-y-auto animate-fade-in">
            <div className="p-4 space-y-2">
            {/* Properties Section */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Management</p>
              
              <button
                onClick={() => { navigate('/admin/properties'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoHomeSharp size={18} className="text-blue-600" />
                <span className="font-medium">List Properties</span>
              </button>

              <button
                onClick={() => { navigate('/admin/add-property'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoBagAdd size={18} className="text-green-600" />
                <span className="font-medium">Add Property</span>
              </button>

              <button
                onClick={() => { navigate('/admin/appointments'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoCalendarSharp size={18} className="text-purple-600" />
                <span className="font-medium">View Appointments</span>
              </button>

              <button
                onClick={() => { navigate('/admin/offers'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <IoCashSharp size={18} className="text-green-600" />
                <span className="font-medium">Manage Offers</span>
                {pendingOffersCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {pendingOffersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { navigate('/admin/notifications'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoChatbubblesSharp size={18} className="text-orange-600" />
                <span className="font-medium">SMS Notifications</span>
              </button>

              {user.role?.role === 'admin' && (
                <button
                  onClick={() => { navigate('/admin/users'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoPeopleSharp size={18} className="text-red-600" />
                  <span className="font-medium">Manage Users</span>
                </button>
              )}
            </div>

            {/* User Section */}
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoSettingsSharp size={18} />
                <span className="font-medium">My Profile</span>
              </button>

              <button
                onClick={() => { logOut(); navigate('/'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <IoLogOutOutline size={18} />
                <span className="font-semibold">Log Out</span>
              </button>
            </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarAdmin