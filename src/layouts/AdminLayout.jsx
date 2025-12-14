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
      {/* Sidebar area (fixed on desktop) */}
      <div className={`hidden md:block`}>
        <div
          className={`fixed left-0 top-0 h-screen p-4 transition-all z-40 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} onNavigate={handleNavigate} />
        </div>
      </div>

     

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="w-full h-full bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <AdminSidebar collapsed={false} setCollapsed={()=>{}} onNavigate={() => { setMobileOpen(false) }} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all pt-3 sm:px-6 px-0 pb-12 overflow-auto ${
        collapsed ? "md:ml-20" : "md:ml-64"
      }`}>
        <div className="max-w-9xl max-sm:py-2 max-sm:mx-3">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
