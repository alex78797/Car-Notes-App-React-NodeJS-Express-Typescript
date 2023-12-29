import { useEffect, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { useLoginUserMutation } from "../features/auth/authApiSlice";
import { removeCredentials, setCredentials } from "../features/auth/authSlice";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Link, useNavigate } from "react-router-dom";
import { apiSlice } from "../app/api/apiSlice";

/**
 *
 * @returns a page where a user can login with email and password
 */
function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { error }] = useLoginUserMutation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * When a user clicks the `Login` button to login, it will triger/run this method
   * whichs first prevents the default behaviour of the browser to refresh the page
   * and then makes a POST request to the server to login the user.
   *
   * The request returns the user and its access token, which are dispatched/sent
   * to the global state.
   *
   * Finally, it navigates the user to the home page.
   *
   * @param e
   */
  async function handleLogin(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const loginData = await login({ email, password }).unwrap();
    dispatch(setCredentials({ ...loginData }));
    navigate("/");
  }

  // check when the component mounts (/loads) if the user is authenticated. If yes redirect him to the home page.
  useEffect(() => {
    async function redirectAuthenticatedUser() {
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
          navigate("/");
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
    redirectAuthenticatedUser();
  }, []);

  return (
    // Center the container (which contains the Form and the h1 tag) horizontally and vertically,
    // and align items in a "column" direction (from top to bottom).
    <Container className="d-flex min-vh-100 justify-content-center align-items-center flex-column">
      <h1>Login</h1>
      <Form>
        <Form.Group className="mb-3 my-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Text className="text-muted">
            Did not register yet? Navigate to{" "}
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Register Page
            </Link>
          </Form.Text>
        </Form.Group>

        {/* @ts-ignore */}
        {error && <p style={{ color: "red" }}>{error.data.error}</p>}

        <Button variant="primary" type="submit" onClick={handleLogin}>
          Login
        </Button>
      </Form>
    </Container>
  );
}

export default Login;
