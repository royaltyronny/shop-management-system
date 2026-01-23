import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProductsPage from './pages/Products'
import InventoryPage from './pages/Inventory'
import SalesPage from './pages/Sales'
import CustomersPage from './pages/Customers'
import SettingsPage from './pages/Settings'
import SuppliersPage from './pages/Suppliers'
import PurchasesPage from './pages/Purchases'
import UsersPage from './pages/Users'
import LoginPage from './pages/Login'
import { Toaster } from '@/components/ui/toaster'
import { CommandPalette } from '@/components/CommandPalette'

import { AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/PageTransition'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Sidebar } from './components/Sidebar'

function App() {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (token) {
      // Validate token
      window.api.auth.validateToken(token)
        .then(() => {
          setIsAuthenticated(true)
        })
        .catch(() => {
          localStorage.removeItem('authToken')
          localStorage.removeItem('currentUser')
          setIsAuthenticated(false)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      window.api.auth.logout(token)
    }
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Animated Background Mesh - Nude Blue & Terracotta */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f8fafb]">
        <div className="mesh-blob top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#a8bfcf]/25 animate-[blob_20s_infinite]" />
        <div
          className="mesh-blob top-[10%] right-[-5%] w-[45%] h-[45%] bg-[#8fa8b8]/20 animate-[blob_25s_infinite_reverse]"
          style={{ animationDelay: '-2s' }}
        />
        <div
          className="mesh-blob bottom-[-5%] left-[15%] w-[55%] h-[55%] bg-[#7092a5]/18 animate-[blob_30s_infinite]"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="mesh-blob top-[40%] left-[30%] w-[40%] h-[40%] bg-[#d4b5a0]/15 animate-[blob_22s_infinite_alternate]"
          style={{ animationDelay: '-7s' }}
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[100px]" />
      </div>

      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col ml-32">
        <div className="flex-1 overflow-auto p-8 pt-6">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route
                path="/products"
                element={
                  <PageTransition>
                    <ProductsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/inventory"
                element={
                  <PageTransition>
                    <InventoryPage />
                  </PageTransition>
                }
              />
              <Route
                path="/sales"
                element={
                  <PageTransition>
                    <SalesPage />
                  </PageTransition>
                }
              />
              <Route
                path="/customers"
                element={
                  <PageTransition>
                    <CustomersPage />
                  </PageTransition>
                }
              />
              <Route
                path="/settings"
                element={
                  <PageTransition>
                    <SettingsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <PageTransition>
                    <SuppliersPage />
                  </PageTransition>
                }
              />
              <Route
                path="/purchases"
                element={
                  <PageTransition>
                    <PurchasesPage />
                  </PageTransition>
                }
              />
              <Route
                path="/users"
                element={
                  <PageTransition>
                    <UsersPage />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </main>

      <Toaster />
      <CommandPalette />
    </div>
  )
}

export default App
