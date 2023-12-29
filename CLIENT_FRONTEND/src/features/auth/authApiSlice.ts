import { apiSlice } from "../../app/api/apiSlice";
import { IUser } from "../../types/types";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<
      void,
      {
        userName: string;
        email: string;
        password: string;
        confirmPassword: string;
      }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    loginUser: builder.mutation<
      { user: IUser; accessToken: string },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
} = authApiSlice;
