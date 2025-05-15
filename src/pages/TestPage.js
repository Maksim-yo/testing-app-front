import { useUser } from "@clerk/clerk-react";
import { CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import EmployeeTestList from "./employee/EmployeeTestList";
const TestsPage = () => {
  const { isLoaded, user } = useUser();
  const isAdmin = user?.unsafeMetadata?.isAdmin;
  const userRole = isAdmin ? "admin" : "employee";

  if (!isLoaded) return <CircularProgress />;

  if (userRole === "admin") return <Dashboard />;
  if (userRole === "employee") return <EmployeeTestList />;
};

export default TestsPage;
