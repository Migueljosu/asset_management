//index
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { AppGate } from './context/AppGate'
import { Toaster } from 'sonner'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      {' '}
      <AppGate>
        <AppProvider>
          <Toaster richColors position="top-right" />

          <RouterProvider router={router} />
        </AppProvider>
      </AppGate>
    </AuthProvider>
  </React.StrictMode>
)
