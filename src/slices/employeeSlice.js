import { createSlice } from "@reduxjs/toolkit";
import { generateAccountAsync } from "./employeeThunk";

const initialState = {
  employees: [
    {
      id: 1,
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      positionId: 1,
      phone: "+7 (123) 456-78-90",
      photo: "/path/to/photo.jpg",
    },
  ],

  accounts: [],
  status: "idle",
  error: null,
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee: (state, action) => {
      const newEmployee = {
        ...action.payload,
        id: Date.now(),
        accountGenerated: false,
      };
      state.employees.push(newEmployee);
    },
    editEmployee: (state, action) => {
      const index = state.employees.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action) => {
      return state.employees.filter((e) => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAccountAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateAccountAsync.fulfilled, (state, action) => {
        state.accounts.push(action.payload);

        const employee = state.employees.find(
          (e) => e.id === action.payload.employeeId
        );
        if (employee) {
          employee.accountGenerated = true;
        }
        state.status = "succeeded";
      })
      .addCase(generateAccountAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addEmployee, editEmployee, deleteEmployee } =
  employeeSlice.actions;
export default employeeSlice.reducer;
