import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import employeeReducer from "../slices/employeeSlice";
import positionReducer from "../slices/positionSlice";
import rolesReducer from "../slices/roleSlice";
import positionsBeblbinReducer from "../slices/positionsBelbinSlice";
import testsReducer from "../slices/testSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    employees: employeeReducer,
    positions: positionReducer,
    roles: rolesReducer,
    positionsBelbin: positionsBeblbinReducer,
    tests: testsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
