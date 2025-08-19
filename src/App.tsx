import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Navigation } from "./components/Navigation";
import { ServersPage } from "./components/ServersPage";
import { MatchesPage } from "./components/MatchesPage";
import { CommandsPage } from "./components/CommandsPage";
import { TicketsPage } from "./components/TicketsPage";
import { UsersPage } from "./components/UsersPage";
import { ChangelogPage } from "./components/ChangelogPage";
import { AuthCallback } from "./components/AuthCallback";
import { ErrorPage } from "./components/ErrorPage";
import { InviteRedirect } from "./components/InviteRedirect";
import { AuthProvider } from "./contexts/AuthContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <DarkModeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/invite" element={<InviteRedirect />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </DarkModeProvider>
    </Router>
  );
}

function AppContent() {
  return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/servers" element={<ServersPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/commands" element={<CommandsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
