import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar/AdminSidebar'

export default function AdminLayout(){
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = () => {
    // on mobile close after navigation
    if (mobileOpen) setMobileOpen(false)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7]">
      {/* Sidebar area */}
      <div className={`hidden md:flex flex-shrink-0 h-screen p-4`}> 
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} onNavigate={handleNavigate} />
      </div>

      {/* Mobile toggle and overlay sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 bg-white rounded-md shadow"
          aria-label="Open admin menu"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <AdminSidebar collapsed={false} setCollapsed={()=>{}} onNavigate={() => { setMobileOpen(false) }} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all pt-3 sm:px-6 px-0 pb-12 ${collapsed ? 'md:pl-0' : 'md:pl-0'}`}>
        <div className="max-w-9xl max-sm:py-2 max-sm:mx-3">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
