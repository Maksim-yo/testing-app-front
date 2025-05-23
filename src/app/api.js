import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Clerk } from "@clerk/clerk-react";

const baseQueryWithClerk = async (args, api, extraOptions) => {
  const token = await window.Clerk?.session?.getToken({
    template: "test_app", // Если не используешь шаблон — убери эту строку
  });
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  return rawBaseQuery(args, api, extraOptions);
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithClerk,
  tagTypes: [
    "Employees",
    "Positions",
    "Tests",
    "BelbinTests",
    "BelbinRoles",
    "BelbinTests",
    "BelbinPositions",
    "Profile",
  ],
  endpoints: (builder) => ({
    // Positions
    getPositions: builder.query({
      query: () => "positions/",
      providesTags: ["Positions"],
    }),
    createPosition: builder.mutation({
      query: (newPosition) => ({
        url: "positions/",
        method: "POST",
        body: newPosition,
      }),
      invalidatesTags: ["Positions"],
    }),

    updatePosition: builder.mutation({
      query: (position) => ({
        url: `positions/${position.id}`,
        method: "PUT",
        body: position,
      }),
      invalidatesTags: ["Positions"],
    }),

    deletePosition: builder.mutation({
      query: (position_id) => ({
        url: `positions/${position_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Positions"],
    }),
    // Employees
    getEmployees: builder.query({
      query: () => "employees/",
      providesTags: ["Employees"],
    }),
    createEmployee: builder.mutation({
      query: (employee) => ({
        url: "employees/local/",
        method: "POST",
        body: employee,
      }),
      invalidatesTags: ["Employees"],
    }),
    createClerkEmployees: builder.mutation({
      query: (employee) => ({
        url: "employees/clerk/",
        method: "POST",
        body: employee,
      }),
      invalidatesTags: ["Employees"],
    }),
    updateEmployee: builder.mutation({
      query: ({ employee, employeeId }) => ({
        url: `employees/${employeeId}/`,
        method: "PUT",
        body: employee,
      }),
      invalidatesTags: ["Employees"],
    }),
    deleteEmployee: builder.mutation({
      query: (employeeId) => ({
        url: `employees/${employeeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"], // Обновление или сброс кеша при изменении данных сотрудников
    }),
    // Tests
    createTest: builder.mutation({
      query: (test) => ({
        url: "tests/",
        method: "POST",
        body: test,
      }),
      invalidatesTags: ["Tests"],
    }),
    getTests: builder.query({
      query: () => `tests/`,
      providesTags: ["Tests"],
    }),
    deleteTest: builder.mutation({
      query: (testId) => ({
        url: `tests/${testId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tests"],
    }),
    getTestsByPosition: builder.query({
      query: (positionId) => `positions/${positionId}/tests/`,
      providesTags: ["Tests"],
    }),
    updateTestStatus: builder.mutation({
      query: ({ testId, status }) => ({
        url: `/tests/${testId}/status/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Tests"],
    }),
    getAssignedTests: builder.query({
      query: () => `/tests/assign/`,
      providesTags: ["Tests"],
    }),
    setAssignmentsToTest: builder.mutation({
      query: (assignments) => ({
        url: `/tests/assign/`,
        method: "POST",
        body: { assignments },
      }),
      invalidatesTags: ["Tests"],
    }),

    deleteAssignment: builder.mutation({
      query: (assignments) => ({
        url: `/tests/unassign/`,
        method: "POST",
        body: { assignments },
      }),
      invalidatesTags: ["Tests"],
    }),

    evaluateBelbinTest: builder.mutation({
      query: (id) => ({
        url: `belbin-tests/${id}/evaluate`,
        method: "POST",
      }),
      invalidatesTags: ["BelbinTests"],
    }),
    updateTest: builder.mutation({
      query: (test) => ({
        url: `tests/${test.id}`,
        method: "PUT",
        body: test,
      }),
      invalidatesTags: ["Tests"],
    }),
    getBelbinTestResults: builder.query({
      query: (id) => `belbin-tests/${id}/results`,
      providesTags: ["BelbinTests"],
    }),
    checkBackend: builder.query({
      query: () => `/ping`,
    }),
    getBelbinRoles: builder.query({
      query: (id) => `belbin-roles/`,
      providesTags: ["BelbinRoles"],
    }),

    updateBelbinRole: builder.mutation({
      query: (role) => ({
        url: `belbin-roles/`,
        method: "PUT",
        body: role,
      }),
      invalidatesTags: ["BelbinRoles"],
    }),
    deleteBelbinRole: builder.mutation({
      query: (id) => ({
        url: `belbin-roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BelbinRoles"],
    }),

    createBelbinRole: builder.mutation({
      query: (role) => ({
        url: "belbin-roles/",
        method: "POST",
        body: role,
      }),
      invalidatesTags: ["BelbinRoles"],
    }),

    createBelbinPosition: builder.mutation({
      query: (position) => ({
        url: "belbin-positions/",
        method: "POST",
        body: position,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["BelbinPositions"],
    }),

    updateBelbinPosition: builder.mutation({
      query: (position) => ({
        url: `belbin-positions/${position.position_id}/`,
        method: "PUT",
        body: position,
      }),
      invalidatesTags: ["BelbinPositions"],
    }),

    deleteBelbinPositions: builder.mutation({
      query: (id) => ({
        url: `belbin-positions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BelbinPositions"],
    }),

    getBelbinPositions: builder.query({
      query: () => `belbin-positions/`,
      providesTags: ["BelbinPositions"],
    }),

    submitTest: builder.mutation({
      query: (result) => ({
        url: "submit-quiz",
        method: "POST",
        body: result,
      }),
    }),

    deleteBelbinRequiriment: builder.mutation({
      query: (id) => ({
        url: `belbin-requiriments/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["BelbinPositions"],
    }),
    startTest: builder.mutation({
      query: (testId) => ({
        url: `/test/start/${testId}`,
        method: "POST",
      }),
      invalidatesTags: ["Tests"],
    }),

    // Завершение теста
    completeTest: builder.mutation({
      query: (testId) => ({
        url: `/test/complete/${testId}`,
        method: "POST",
      }),
      invalidatesTags: ["Tests"],
    }),

    // Сохранение ответа
    saveTestAnswer: builder.mutation({
      query: (answer) => ({
        url: `/test/save_answer/`,
        method: "POST",
        body: answer,
      }),
      invalidatesTags: ["Tests"],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: "/auth/create_user/",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Profile"],
    }),

    resetTestForEmployee: builder.mutation({
      query: ({ testId, employeeId }) => ({
        url: `/tests/${testId}/employees/${employeeId}/reset`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tests"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/me/profile/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    getCurrentUser: builder.query({
      query: () => `/me/profile/`,
      providesTags: ["Profile"],
    }),
    deleteCurrentUser: builder.mutation({
      query: () => ({
        url: "/me/profile/",
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),

    getTestResults: builder.query({
      query: (id) => `tests/${id}/result`,
      providesTags: ["Tests"],
    }),
  }),
});

export const {
  useResetTestForEmployeeMutation,
  useGetPositionsQuery,
  useCreatePositionMutation,
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useCreateTestMutation,
  useGetTestsQuery,
  useGetTestsByPositionQuery,
  useEvaluateBelbinTestMutation,
  useGetBelbinTestResultsQuery,
  useUpdateTestMutation,
  useSubmitTestMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useDeletePositionMutation,
  useUpdatePositionMutation,
  useGetBelbinPositionsQuery,
  useCreateBelbinPositionMutation,
  useDeleteBelbinPositionsMutation,
  useUpdateBelbinPositionMutation,
  useGetBelbinRolesQuery,
  useCreateBelbinRoleMutation,
  useDeleteBelbinRoleMutation,
  useUpdateBelbinRoleMutation,
  useDeleteBelbinRequirimentMutation,
  useDeleteTestMutation,
  useUpdateTestStatusMutation,
  useGetAssignedTestsQuery,
  useStartTestMutation,
  useCompleteTestMutation,
  useSaveTestAnswerMutation,
  useCreateUserMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useDeleteCurrentUserMutation,
  useCreateClerkEmployeesMutation,
  useSetAssignmentsToTestMutation,
  useDeleteAssignmentMutation,
  useGetTestResultsQuery,
  useCheckBackendQuery,
} = api;
