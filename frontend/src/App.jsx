
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import CreateExperimentPage from "./pages/CreateExperimentPage";
import ExperimentDetailPage from "./pages/ExperimentDetailPage";
import ProfilePage from "./pages/ProfilePage";
import Sidebar from "./components/Sidebar";


function LayoutWithSidebar({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 ">{children}</div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <LayoutWithSidebar>
                  <DashboardPage />
                </LayoutWithSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/create-experiment"
            element={
              <PrivateRoute>
                <LayoutWithSidebar>
                  <CreateExperimentPage />
                </LayoutWithSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/experiments/:id"
            element={
              <PrivateRoute>
                <LayoutWithSidebar>
                  <ExperimentDetailPage />
                </LayoutWithSidebar>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <LayoutWithSidebar>
                  <ProfilePage />
                </LayoutWithSidebar>
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;