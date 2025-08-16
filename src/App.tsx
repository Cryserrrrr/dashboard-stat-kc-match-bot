import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Navigation } from "./components/Navigation";
import { ServersPage } from "./components/ServersPage";
import { MatchesPage } from "./components/MatchesPage";
import { CommandsPage } from "./components/CommandsPage";
import { TicketsPage } from "./components/TicketsPage";
import { UsersPage } from "./components/UsersPage";
import { AuthCallback } from "./components/AuthCallback";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
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
    </Router>
  );
}

function AppContent() {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Dashboard />;
      case "servers":
        return <ServersPage />;
      case "matches":
        return <MatchesPage />;
      case "commands":
        return <CommandsPage />;
      case "tickets":
        return <TicketsPage />;
      case "users":
        return <UsersPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      {renderContent()}
    </div>
  );
}

export default App;
