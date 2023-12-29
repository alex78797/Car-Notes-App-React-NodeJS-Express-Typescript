import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { IUser } from "../../types/types";

interface IInitialState {
  user: IUser | null;
  accessToken: string | null;
}

const initialState: IInitialState = {
  user: null,
  accessToken: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      {
        payload: { user, accessToken },
      }: PayloadAction<{ user: IUser; accessToken: string }>
    ) => {
      state.user = user;
      state.accessToken = accessToken;
    },
    removeCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, removeCredentials } = slice.actions;

export default slice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
