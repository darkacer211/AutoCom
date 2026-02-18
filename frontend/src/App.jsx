import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AppProvider } from './context/AppContext'
import { ToastBridge } from './components/ToastBridge'
import { MainLayout } from './components/layout/MainLayout'
import { Login } from './pages/Login'
// import { Signup } from './pages/auth/Signup'
import { Dashboard } from './pages/Dashboard'
import { SendEmail } from './pages/SendEmail'
import { Inbox } from './pages/Inbox'
import { WhatsApp } from './pages/WhatsApp'
import { Templates } from './pages/Templates'
import { Logs } from './pages/Logs'
import { Settings } from './pages/Settings'
import { Test } from './pages/Test'

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <ToastBridge />
          <Router>
            <Routes>
              {/* Test route - no auth needed */}
              <Route path="/test" element={<Test />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              {/* <Route path="/signup" element={<Signup />} /> */}

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="send-email" element={<SendEmail />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="whatsapp" element={<WhatsApp />} />
                <Route path="templates" element={<Templates />} />
                <Route path="logs" element={<Logs />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
