import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { ErrorBoundary } from "./components/ui/ErrorBoundary"
import { AuthProvider } from "./hooks/useAuth.tsx"
import { TooltipProvider } from "./components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </StrictMode>,
)
