import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { removeCredentials } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { apiSlice } from "../app/api/apiSlice";
import { useLogoutUserMutation } from "../features/auth/authApiSlice";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useState } from "react";

/**
 *
 * @returns A page (/component), which renders the layout of the application: the navbar, and the pages rendered under the navbar (the outlet).
 * The <Outlet /> component renders the child route's element, if there is one. (The routes and their children are defined in App.tsx).
 * For example, if one goes to the AddCar page, this Layout function will render the navbar and the AddCar page (the outlet).
 * For example, if one goes to the EditCar page, this Layout function will render the navbar and the EditCar page (the outlet).
 * For example, if one goes to the Home page, this Layout function will render the navbar and the Home page (the outlet).
 * For example, if one goes to the Login page, we have no currentUser. Only the Login page is rendered.
 * For example, if one goes to the Register page, we have no currentUser. Only the Register page is rendered.
 */
function Layout() {
  // get the current user from the global state
  const currentUser = useAppSelector((state) => state.auth.user);

  // use `useDispatch()` hook to send data to the global state
  const dispatch = useDispatch();

  // use the `useLogoutUserMutation()` hook in order to make the POST request to logout the user
  const [logout, { error }] = useLogoutUserMutation();

  // use hte `useNavigate` hook to navigate to a particular page
  const navigate = useNavigate();

  /**
   * When the user clicks the `Log Out` button/text, it triggers/runs this method, which
   * first prevents the default browser behaviour the refresh the page,
   * then makes a POST request to log out.
   *
   * Finally it removes all credentials from state (user and access token) and clears the previous state of the user.
   *
   * It then redirectes automatically to the login page. (If not, it should be done `manually` with react-router-dom.)
   */
  async function handleLogout(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault();
    await logout().unwrap();
    dispatch(removeCredentials());
    dispatch(apiSlice.util.resetApiState());
    // navigate("/login")
  }

  /**
   * When the user clicks the button to reset the password, it triggers this method
   * which first prevents the default browser behaviour to refresh the page
   * and then redirects the user to the reset password page.
   * @param e
   */
  function handleNavigateToResetPasswordPage(
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) {
    e.preventDefault();
    navigate("/resetPassword");
  }

  /**
   * When the user clicks the button to delete the account, it triggers this method
   * which first prevents the default browser behaviour to refresh the page
   * and then redirects the user to the delete account page.
   * @param e
   */
  function handleNavigateToDeleteAccountPage(
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) {
    e.preventDefault();
    navigate("/deleteAccount");
  }

  return (
    <>
      {currentUser && (
        <Navbar
          collapseOnSelect
          expand="lg"
          className="bg-body-tertiary"
          sticky="top"
        >
          <Container>
            <Link to="/" style={{ textDecoration: "none", cursor: "pointer" }}>
              <Navbar.Brand>Welcome {currentUser.userName}</Navbar.Brand>
            </Link>

            <Navbar.Toggle aria-controls="responsive-navbar-nav" />

            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto"></Nav>

              <Nav>
                <Link
                  style={{
                    textDecoration: "none",
                    cursor: "pointer",
                    display: "flex", // otherwise it is not centered vertically
                    marginRight: "20px", // to add more space to the text right of the link
                  }}
                  to="/addCar"
                >
                  <Navbar.Text>Add Car </Navbar.Text>
                </Link>

                <NavDropdown
                  title="Account Settings"
                  id="navbarScrollingDropdown"
                >
                  <NavDropdown.Item
                    onClick={handleLogout}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Log Out
                  </NavDropdown.Item>

                  <NavDropdown.Item
                    onClick={handleNavigateToResetPasswordPage}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Change Password
                  </NavDropdown.Item>

                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={handleNavigateToDeleteAccountPage}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Delete Account
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      {/* @ts-ignore */}
      {error && <p style={{ color: "red" }}>{error.data.error}</p>}

      <Outlet />
    </>
  );
}

export default Layout;
