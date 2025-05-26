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
import CompleteSignUpPage from "../pages/CompleteProfile";
import BelbinTest from "../pages/BelbinTest";
import TestCompletedPage from "../pages/employee/TestCompletedPage";
import VerifyAgainPage from "./VerifyAgainPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ResetPasswordVerification from "../pages/ResetPasswordVerification";
import UserResultsPage from "../components/test/UserResultsPage";
import TestSolver from "../pages/employee/TestSolver";
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
          <RoleProtectedRoute role="admin">
            <SignedIn>
              <AppLayout>
                <AdminPage />
              </AppLayout>
            </SignedIn>
          </RoleProtectedRoute>
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
              <Navigate to="/tests" />
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
              <Navigate to="/tests" />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/me"
        element={
          <>
            <SignedIn>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </SignedIn>
            <SignedOut>
              <Navigate to="/sign-in" />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Navigate to="/tests" />
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
            <RoleProtectedRoute role="admin">
              <AppLayout>
                <UserResultsPage />
              </AppLayout>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />
      <Route
        path="/test-completed"
        element={
          <SignedIn>
            <AppLayout>
              <TestCompletedPage />
            </AppLayout>
          </SignedIn>
        }
      />{" "}
      <Route
        path="/reset-password"
        element={
          <SignedOut>
            <ResetPasswordPage />
          </SignedOut>
        }
      />
      <Route
        path="/reset-password-verification"
        element={
          <SignedOut>
            <ResetPasswordVerification />
          </SignedOut>
        }
      />
      <Route
        path="/verify-again"
        element={
          <SignedIn>
            <AppLayout>
              <VerifyAgainPage />
            </AppLayout>
          </SignedIn>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/tests"
        element={
          <RoleProtectedRoute>
            <SignedIn>
              <AppLayout>
                <TestsPage />
              </AppLayout>
            </SignedIn>
          </RoleProtectedRoute>
        }
      />
      <Route path="/complete-profile" element={<CompleteSignUpPage />} />
      {/* Основные маршруты */}
    </Routes>
  );
}
