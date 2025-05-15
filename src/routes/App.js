import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminPage from "../pages/AdminPage";
import QuestionPage from "../pages/QuestionPage";
import {
  SignedIn,
  UserButton,
  SignInButton,
  SignedOut,
  SignIn,
} from "@clerk/clerk-react";
import { Dashboard } from "../pages/Dashboard";
import { Box, Container } from "@mui/material";
import AppLayout from "../components/AppLayout";
import BelbinResults from "../components/belbin/BelbinResult";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import { BelbinRolesManager } from "../components/belbin/BelbinRolesManager";
import { BelbinPositionManager } from "../components/belbin/BelbinPositionsManager";
import { BelbinManager } from "../components/belbin/BelbinManager";
import TestStatsPage from "../components/test/TestsStatPage";
import { BelbinQuestion } from "../components/test/BelbinQuestion";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignupPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ProfilePage from "../pages/ProfilePage";
import TestsPage from "../pages/TestPage";
export default function App() {
  return (
    <Routes>
      {/* Редирект со старого URL на новый */}

      {/* <Route
        path="/quiz"
        element={
          <SignedIn>
            <AdminPage1 />
          </SignedIn>
        }
      /> */}

      {/* Условный редирект */}
      <Route
        path="/admin"
        element={
          <SignedIn>
            <RoleProtectedRoute role="admin">
              <AppLayout>
                <AdminPage />
              </AppLayout>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/sign-in"
        element={
          <>
            <SignedOut>
              <SignInPage />
            </SignedOut>
            <SignedIn>
              <Navigate to="/admin" />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/sign-up"
        element={
          <>
            <SignedOut>
              <SignUpPage />
            </SignedOut>
            <SignedIn>
              <Navigate to="/admin" />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/me"
        element={
          <SignedIn>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </SignedIn>
        }
      />
      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Navigate to="/admin" />
            </SignedIn>
            <SignedOut>
              <Navigate to="/sign-in" />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/belbin-result"
        element={
          // <SignedIn>
          <BelbinQuestion
            questions={[
              {
                question:
                  "Я умею влиять на людей, не оказывая на них давления.",
                answers: [
                  "Совершенно не согласен",
                  "Скорее не согласен",
                  "Затрудняюсь ответить",
                  "Скорее согласен",
                  "Полностью согласен",
                ],
              },
              {
                question:
                  "Я готов оказать давление, чтобы совещание не превращалось в пустую трату времени.",
                answers: [
                  "Совершенно не согласен",
                  "Скорее не согласен",
                  "Затрудняюсь ответить",
                  "Скорее согласен",
                  "Полностью согласен",
                ],
              },
            ]}
          /> // </SignedIn>
        }
      />
      <Route
        path="/belbin-role"
        element={
          <SignedIn>
            <RoleProtectedRoute role="admin">
              <AppLayout>
                <BelbinManager />
              </AppLayout>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/teststats"
        element={
          <SignedIn>
            <AppLayout>
              <TestStatsPage />
            </AppLayout>
          </SignedIn>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/tests"
        element={
          <SignedIn>
            <AppLayout>
              <TestsPage />
            </AppLayout>
          </SignedIn>
        }
      />

      {/* Основные маршруты */}
    </Routes>
  );
}
