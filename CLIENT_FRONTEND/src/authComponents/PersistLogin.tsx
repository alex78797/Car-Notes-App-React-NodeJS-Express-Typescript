import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { removeCredentials, setCredentials } from "../features/auth/authSlice";
import { apiSlice } from "../app/api/apiSlice";
// import Spinner from "react-bootstrap/Spinner";

/**
 *
 * @returns Component to persist login state after page refresh. Component is used in App.tsx
 */
function PersistLoginWithoutCheckbox() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const dispatch = useAppDispatch();

  useEffect(() => {
    /**
     * When the component mounts (/loads), make a request to receive a new access token and the current user.
     * (If the refresh token is not expired), dispatch the new access token and the user to the global state.
     * Otherwise log user out.
     */
    async function verifyRefreshToken() {
      try {
        const response: Response = await fetch(
          "http://localhost:3000/api/auth/refresh",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (data && data.user && data.newAccessToken) {
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.newAccessToken,
            })
          );
        } else {
          // ASSUME REFRESH TOKEN EXPIRED AND LOG USER OUT
          await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          dispatch(removeCredentials());
          dispatch(apiSlice.util.resetApiState());
        }
      } catch (err) {
        // ASSUME REFRESH TOKEN EXPIRED AND LOG USER OUT
        await fetch("http://localhost:3000/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        dispatch(removeCredentials());
        dispatch(apiSlice.util.resetApiState());
      } finally {
        setIsLoading(false);
      }
    }

    // if we do not have access token, we use the verifyRefreshToken() function above to persist login
    !accessToken ? verifyRefreshToken() : setIsLoading(false);
  }, []);

  // return <>{isLoading ? <Spinner animation="border" /> : <Outlet />}</>;
  return <>{!isLoading && <Outlet />}</>;
}

export default PersistLoginWithoutCheckbox;
