import Sidebar from "../components/layout/Sidebar"
import Topbar from "../components/layout/Topbar"
import { Outlet } from "react-router-dom"

export default function DashboardLayout() {

  return (
    <div className="flex flex-col min-h-screen">

      {/* Topbar */}
      <Topbar />

      {/* área principal */}
      <div className="flex flex-1">

        <Sidebar />
      
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>
      {/* Footer */}
        { (
          <footer className="bg-card text-card-foreground shadow-sm transition-colors mt-auto">
            <div className="container mx-auto px-6 py-4">
              <p className="text-center text-muted-foreground">
                 @Pedro Alfredo. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        )}

    </div>
  )
}