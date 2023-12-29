import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import {
  removeCredentials,
  setCredentials,
} from "../../features/auth/authSlice";
import { Mutex } from "async-mutex";
import { IUser } from "../../types/types";

// SCENARIO: if multiple requests get fired and the access token is not valid
// all of them will get 403 as a response and all of them will try to refresh an access token
// which will result in the first one being successful and other ones will fail
// and then the user is navigated to log in screen.

// ----> use a mutex

// mutex is locked <---> another request already returned a 403 and the access token is being refreshed 

// If there is an auth error, either
// - lock the mutex to try to make a request for an auth token,
//   and then retry the original query (because now the user is probably authenticated again)
// - wait for the already locked mutex (after that, a reauth will have taken place)
//   and then retry the original query (because now the user is probably authenticated again)

// create a new mutex (at the beginning it is not locked)
const mutex = new Mutex();
// console.log(mutex.isLocked());

// base query which defines the base url, includes cookies and the requests and sets the authorization header
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) {
      headers.set("authorization", "Bearer" + " " + accessToken);
    }
    return headers;
  },
});

// base query which automatically reauthenticates the user if its access token expires (similarly to axios interceptors)
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it <---> wait with new requests if a reauth is going on
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  // a little different from the docs: used here `originalStatus` instead of `status`
  if (
    result.error &&
    "originalStatus" in result.error &&
    result.error.originalStatus === 403
  ) {
    // checking whether the mutex is locked.
    // condition can be checked by multiple requests if the mutex is not locked at the beginning.
    // for example open home page in browser, multiple requests are made while mutex still not locked.
    if (!mutex.isLocked()) {
      // Calling acquire will return a promise that resolves once the mutex becomes available.
      // The value of the resolved promise is a function that can be called to release the mutex once the task has completed.
      // ---> Only one request in this critical section.
      const release = await mutex.acquire();
      try {
        // get a new access token if the old one expired and the refresh token is still valid
        const refreshResult = await baseQuery(
          "/auth/refresh",
          api,
          extraOptions
        );

        // @ts-ignore
        const newAccessToken: string = refreshResult.data?.newAccessToken;
        // @ts-ignore
        const user: IUser = refreshResult.data?.user;

        // store the new access token in global state
        if (newAccessToken && user) {
          api.dispatch(
            setCredentials({ user: user, accessToken: newAccessToken })
          );
          // retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          // logout (delete cookie from browser), remove credentials, delete all previous state
          await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          api.dispatch(removeCredentials());
          api.dispatch(apiSlice.util.resetApiState());
        }
      } finally {
        // release must be called once the mutex should be released again
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      // mutex is unlocked, a reauth took place, user is probably authenticated again ---> retry original query
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["cars", "carBrands"],
  // underscore `_` is added to please typescript (variable not used (?))
  endpoints: (_builder) => ({}),
});
