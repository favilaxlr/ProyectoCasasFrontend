import {Link, useNavigate} from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { IoPerson, IoLogOutOutline, IoChevronDownSharp, IoBagAdd, IoHomeSharp, IoCalendarSharp, IoChatbubblesSharp, IoPeopleSharp, IoSettingsSharp, IoCashSharp, IoMenu, IoClose, IoPricetagOutline} from 'react-icons/io5'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import { useNotificationCount } from '../hooks/useNotificationCount';
import { useState } from 'react';

function NavbarAdmin() {
  const {user, logOut} = useAuth();
  const navigate = useNavigate();
  const { pendingOffersCount, pendingAppointmentsCount, pendingListingRequestsCount } = useNotificationCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 backdrop-blur-2xl bg-gradient-to-r from-[var(--soft-black)] via-[#05172a] to-[var(--deep-teal)] border-b border-white/10 shadow-[0_25px_60px_rgba(3,8,24,0.65)]" style={{ zIndex: 10000, borderBottomWidth: '1px' }}>
      <div className="relative w-full px-3 md:px-6 py-3 md:py-4">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[var(--gold-accent)] blur-[140px]"></div>
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[var(--hyper-pink)] blur-[120px]"></div>
        </div>
        <div className="flex justify-between items-center relative z-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden text-white p-2 hover:bg-white/15 rounded-xl transition-colors absolute left-3 z-10"
          >
            {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
          </button>
          {/* Logo */}
          <Link to='/' className="hover:scale-105 transition-transform duration-300 mx-auto md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <Logo size="small" className="md:size-medium" />
          </Link>

          {/* Desktop Navigation Items */}
          <ul className="hidden lg:flex gap-3 items-center ml-auto">
            {/* Propiedades Menu */}
            <li className="relative">
              <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white/90 bg-white/10 border border-white/10 hover:border-white/40 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm">
                  <IoHomeSharp size={18}/>
                  Properties
                  <IoChevronDownSharp className="fill-current" size={14} />
                </MenuButton>

                <MenuItems
                  modal
                  transition
                  className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-3xl border border-white/20 bg-[var(--glass-white)] backdrop-blur-xl p-3 text-sm shadow-[0_25px_70px_rgba(3,8,24,0.45)] transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  style={{ zIndex: 10001 }}
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
                    <button onClick={ ()=>{navigate('/sell')}}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                        <IoPricetagOutline className="text-amber-600" size={16} />
                      </div>
                      <span className="font-medium">Sell Your Home</span>
                    </button>
                  </MenuItem>

                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/listing-requests')}}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                        <IoHomeSharp className="text-amber-700" size={16} />
                      </div>
                      <span className="font-medium">Seller Requests</span>
                      {pendingListingRequestsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {pendingListingRequestsCount}
                        </span>
                      )}
                    </button>
                  </MenuItem>
                  
                  <MenuItem>
                    <button onClick={ ()=>{navigate('/admin/appointments')}} 
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 hover:bg-[var(--gold-accent)]/10 hover:text-[var(--gold-accent)] data-focus:bg-[var(--gold-accent)]/10 transition-all">
                      <div className="p-1.5 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        <IoCalendarSharp className="text-purple-600" size={16} />
                      </div>
                      <span className="font-medium">View Appointments</span>
                      {pendingAppointmentsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {pendingAppointmentsCount}
                        </span>
                      )}
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
                <MenuButton className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-[var(--soft-black)] bg-gradient-to-r from-[var(--gold-accent)] via-[var(--electric-sky)] to-[var(--hyper-pink)] shadow-[0_10px_30px_rgba(3,8,24,0.35)] hover:shadow-[0_18px_40px_rgba(3,8,24,0.45)] transition-all duration-200">
                  <IoPerson size={18}/> 
                  {user.username}
                  <IoChevronDownSharp className="text-[var(--soft-black)]" size={14} />
                </MenuButton>

                <MenuItems
                  modal
                  transition
                  className="absolute right-0 top-full mt-2 w-60 origin-top-right rounded-3xl border border-white/20 bg-[var(--glass-white)] backdrop-blur-xl p-3 text-sm shadow-[0_25px_70px_rgba(3,8,24,0.45)] transition duration-200 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                  style={{ zIndex: 10001 }}
                >
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

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-[70px] right-2 w-[calc(100vw-16px)] max-w-sm bg-gradient-to-br from-[var(--soft-black)] via-[#021222] to-[var(--deep-teal)] text-white rounded-3xl shadow-[0_25px_60px_rgba(3,8,24,0.7)] border border-white/10 lg:hidden z-[10001] max-h-[calc(100vh-80px)] overflow-y-auto animate-fade-in">
            <div className="p-4 space-y-2">
              {/* Properties Section */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider px-3 mb-2">Management</p>
                
                <button
                  onClick={() => { navigate('/admin/properties'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoHomeSharp size={18} className="text-[var(--electric-sky)]" />
                  <span className="font-medium">List Properties</span>
                </button>

                <button
                  onClick={() => { navigate('/admin/add-property'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoBagAdd size={18} className="text-[var(--citrus-lime)]" />
                  <span className="font-medium">Add Property</span>
                </button>

                <button
                  onClick={() => { navigate('/sell'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoPricetagOutline size={18} className="text-[var(--gold-accent)]" />
                  <span className="font-medium">Sell Your Home</span>
                </button>

                <button
                  onClick={() => { navigate('/admin/listing-requests'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoHomeSharp size={18} className="text-[var(--ember-orange)]" />
                  <span className="font-medium">Seller Requests</span>
                  {pendingListingRequestsCount > 0 && (
                    <span className="ml-auto bg-white text-[var(--soft-black)] text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {pendingListingRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { navigate('/admin/appointments'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoCalendarSharp size={18} className="text-[var(--hyper-pink)]" />
                  <span className="font-medium">View Appointments</span>
                  {pendingAppointmentsCount > 0 && (
                    <span className="ml-auto bg-white text-[var(--soft-black)] text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {pendingAppointmentsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { navigate('/admin/offers'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors relative"
                >
                  <IoCashSharp size={18} className="text-[var(--electric-sky)]" />
                  <span className="font-medium">Manage Offers</span>
                  {pendingOffersCount > 0 && (
                    <span className="ml-auto bg-white text-[var(--soft-black)] text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {pendingOffersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { navigate('/admin/notifications'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoChatbubblesSharp size={18} className="text-[var(--ember-orange)]" />
                  <span className="font-medium">SMS Notifications</span>
                </button>

                {user.role?.role === 'admin' && (
                  <button
                    onClick={() => { navigate('/admin/users'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                  >
                    <IoPeopleSharp size={18} className="text-[var(--hyper-pink)]" />
                    <span className="font-medium">Manage Users</span>
                  </button>
                )}
              </div>

              {/* User Section */}
              <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-white">{user.username}</p>
                  <p className="text-xs text-white/70">{user.email}</p>
                </div>

                <button
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white/90 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoSettingsSharp size={18} className="text-[var(--electric-sky)]" />
                  <span className="font-medium">My Profile</span>
                </button>

                <button
                  onClick={() => { logOut(); navigate('/'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <IoLogOutOutline size={18} className="text-[var(--hyper-pink)]" />
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