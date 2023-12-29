import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

/**
 * @returns A component that protects routes.
 * If user is authenticated and is an admin, allow the user to access the route, otherwise navigate to home page
 */
export function PrivateOutletAdmin() {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  return user && user.roles.includes("admin") ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} />
  );
}
