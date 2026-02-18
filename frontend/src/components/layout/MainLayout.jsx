import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useState } from 'react'

export function MainLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(256)

  return (
    <div className="min-h-screen bg-background-dark">
      <Sidebar />
      <TopBar sidebarWidth={sidebarWidth} />
      <main
        style={{ marginLeft: `${sidebarWidth}px`, marginTop: '64px' }}
        className="p-6"
      >
        <Outlet />
      </main>
    </div>
  )
}
