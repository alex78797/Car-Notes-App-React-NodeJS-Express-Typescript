import { apiSlice } from "../../app/api/apiSlice";

// Define a service using a base URL and expected endpoints
export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    deleteUser: builder.mutation<void, { userPassword: string }>({
      query: (body) => ({
        url: "/users",
        method: "DELETE",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      void,
      {
        oldPassword: string;
        newPassword: string;
        newPasswordConfirm: string;
      }
    >({
      query: (body) => ({
        url: "/users/resetPassword",
        method: "PUT",
        body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useDeleteUserMutation , useResetPasswordMutation} = usersApiSlice;
