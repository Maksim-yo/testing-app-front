// features/positions/positionsSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { id: 1, title: "Менеджер", salary: 80000, accessLevel: "manager" },
  { id: 2, title: "Разработчик", salary: 120000, accessLevel: "developer" },
];

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    addPosition: (state, action) => {
      state.push({ ...action.payload, id: Date.now() });
    },
    editPosition: (state, action) => {
      const index = state.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deletePosition: (state, action) => {
      return state.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addPosition, editPosition, deletePosition } =
  positionsSlice.actions;
export default positionsSlice.reducer;
