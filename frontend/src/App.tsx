import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { useAutoBackup } from "./features/settings/hooks/useAutoBackup";

function AppShell() {
  useAutoBackup();
  return <AppRoutes />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
