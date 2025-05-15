import { createSlice } from "@reduxjs/toolkit";

// Создаем slice для ролей
const rolesSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [
      {
        id: "1",
        title: "Координатор",
        description: "Умеет направлять команду к общей цели.",
      },
      {
        id: "2",
        title: "Творческий мыслитель",
        description: "Генерирует идеи и нестандартные решения.",
      },
      {
        id: "3",
        title: "Исследователь ресурсов",
        description: "Находит возможности и новые контакты.",
      },
    ],
    currentRole: null,
    mode: "list", // 'list' | 'edit' | 'preview'
  },
  reducers: {
    createRole: (state) => {
      state.currentRole = { id: "new", title: "", description: "" };
      state.mode = "edit";
    },
    editRole: (state, action) => {
      state.currentRole = action.payload;
      state.mode = "edit";
    },
    saveRole: (state, action) => {
      const updatedRole = action.payload;
      if (updatedRole.id === "new") {
        state.roles.push({ ...updatedRole, id: Date.now().toString() });
      } else {
        state.roles = state.roles.map((r) =>
          r.id === updatedRole.id ? updatedRole : r
        );
      }
      state.mode = "list";
      state.currentRole = null;
    },
    deleteRole: (state, action) => {
      state.roles = state.roles.filter((r) => r.id !== action.payload);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    resetCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
});

// Экспортируем actions
export const {
  createRole,
  editRole,
  saveRole,
  deleteRole,
  setMode,
  resetCurrentRole,
} = rolesSlice.actions;

// Экспортируем редьюсер
export default rolesSlice.reducer;
