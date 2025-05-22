import { useUser } from "@clerk/clerk-react";
import { CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import EmployeeTestManager from "./employee/EmployeeTestManager";
const TestsPage = () => {
  const { isLoaded, user } = useUser();
  const isAdmin = user?.unsafeMetadata?.isAdmin;
  const userRole = isAdmin ? "admin" : "employee";
  console.log("gg");
  if (!isLoaded) return <CircularProgress />;

  if (userRole === "admin") return <Dashboard />;
  if (userRole === "employee") return <EmployeeTestManager />;
};

export default TestsPage;
