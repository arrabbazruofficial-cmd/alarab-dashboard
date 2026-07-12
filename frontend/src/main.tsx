import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import './index.css'
import AdminDashboard from './pages/AdminDashboard'
import AgencyDashboard from './pages/AgencyDashboard'
import Login from './pages/Login'
import Register from './pages/Register'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/agency/*" element={<AgencyDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
