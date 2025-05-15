// store/testsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { format } from "date-fns";

const testsSlice = createSlice({
  name: "tests",
  initialState: {
    tests: [
      {
        id: "1",
        title: "Тест по JavaScript",
        description: "Основы JavaScript для начинающих",
        status: "active",
        createdAt: "2023-05-15",
        updatedAt: "2023-05-20",
        questionsCount: 10,
        assignedTo: [],
        questions: [],
      },
      {
        id: "2",
        title: "Тест по React",
        description: "Продвинутые концепции React",
        status: "draft",
        createdAt: "2023-06-01",
        updatedAt: "2023-06-01",
        questionsCount: 5,
        assignedTo: [],
        questions: [],
      },
      {
        id: "3",
        title: "Тест по TypeScript",
        description: "Типизация в TypeScript",
        status: "archive",
        createdAt: "2023-04-10",
        updatedAt: "2023-05-25",
        questionsCount: 8,
        assignedTo: [],
        questions: [],
      },
    ],

    settings: {
      minOptions: 4,
      belbinBlocks: 7,
      belbinOptionsPerBlock: 4,
    },
  },
  reducers: {
    addTest: (state, action) => {
      state.tests.push({
        ...action.payload,
        id: Date.now().toString(),
        assignedTo: [],
        createdAt: format(new Date(), "dd-MM-yyyy"),
        updatedAt: format(new Date(), "dd-MM-yyyy"),
      });
    },
    updateTest: (state, action) => {
      const index = state.tests.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tests[index] = action.payload;
      }
    },
    deleteTest: (state, action) => {
      const testId = action.payload;
      state.tests = state.tests.filter((test) => test.id !== testId);
    },
    assignTest: (state, action) => {
      const { id, assignedTo, dueDate } = action.payload;
      const test = state.tests.find((t) => t.id === id);
      if (test) {
        test.assignedTo = assignedTo;
        test.dueDate = dueDate;
      }
    },

    updateSettings: (state, action) => {
      state.settings = action.payload;
    },
  },
});

export const { addTest, updateTest, assignTest, deleteTest, updateSettings } =
  testsSlice.actions;
export default testsSlice.reducer;
