import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  positions: [
    {
      id: "1",
      title: "Разработчик",
      coefficients: {
        Координатор: 1.2,
        "Творческий мыслитель": 0.8,
        "Исследователь ресурсов": 1.1,
      },
    },
    {
      id: "2",
      title: "Менеджер",
      coefficients: {
        Координатор: 1.5,
        "Творческий мыслитель": 1.0,
        "Исследователь ресурсов": 1.3,
      },
    },
  ],
  currentPosition: null,
  mode: "list", // 'list' | 'edit' | 'preview'
};

const positionsBelbinSlice = createSlice({
  name: "positionsBelbin",
  initialState,
  reducers: {
    addPosition: (state, action) => {
      state.positions.push({ ...action.payload, id: Date.now().toString() });
    },
    updatePosition: (state, action) => {
      const index = state.positions.findIndex(
        (position) => position.id === action.payload.id
      );
      if (index !== -1) {
        state.positions[index] = action.payload;
      }
    },
    deletePosition: (state, action) => {
      state.positions = state.positions.filter(
        (position) => position.id !== action.payload
      );
    },
    // Новые редьюсеры:
    setCurrentPosition: (state, action) => {
      state.currentPosition = action.payload;
    },
    resetCurrentPosition: (state) => {
      state.currentPosition = null;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const {
  addPosition,
  updatePosition,
  deletePosition,
  setCurrentPosition,
  resetCurrentPosition,
  setMode,
} = positionsBelbinSlice.actions;

export default positionsBelbinSlice.reducer;
