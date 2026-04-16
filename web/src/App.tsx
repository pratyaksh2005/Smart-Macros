import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import MedicalPage from "./pages/MedicalPage";
import AppShell from "./pages/AppShell";

import ProtectedRoute from "./components/ProtectedRoute";

import WorkoutTab from "./pages/tabs/WorkoutTab";
import MealsTab from "./pages/tabs/MealsTab";
import GroceryTab from "./pages/tabs/GroceryTab";
import ProfileTab from "./pages/tabs/ProfileTab";
import HardwareTab from "./pages/tabs/HardwareTab";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical"
          element={
            <ProtectedRoute>
              <MedicalPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="workout" replace />} />
          <Route path="workout" element={<WorkoutTab />} />
          <Route path="meals" element={<MealsTab />} />
          <Route path="grocery" element={<GroceryTab />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="hardware" element={<HardwareTab />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}