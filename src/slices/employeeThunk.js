import { createAsyncThunk } from "@reduxjs/toolkit";

const generateUsername = (lastName, firstName, middleName) => {
  const firstLetter = firstName.charAt(0).toLowerCase();
  const middleLetter = middleName ? middleName.charAt(0).toLowerCase() : "";
  return `${lastName.toLowerCase()}${firstLetter}${middleLetter}`;
};

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const generateAccountAsync = createAsyncThunk(
  "employees/generateAccount",
  async (employeeId, { getState }) => {
    const state = getState();
    const employee = state.employees.employees.find((e) => e.id === employeeId);
    const position = state.positions.find((p) => p.id === employee.positionId);
    console.log(generateTempPassword());

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      employeeId,
      username: generateUsername(
        employee.lastName,
        employee.firstName,
        employee.middleName
      ),
      tempPassword: generateTempPassword(),
      accessLevel: position?.accessLevel || "basic",
    };
  }
);
