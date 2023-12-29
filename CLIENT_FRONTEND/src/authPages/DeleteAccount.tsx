import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { removeCredentials } from "../features/auth/authSlice";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useDeleteUserMutation } from "../features/users/usersApiSlice";
import { apiSlice } from "../app/api/apiSlice";

/**
 *
 * @returns A page where the user can delete its account
 */
function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [deleteAccount, { error }] = useDeleteUserMutation();
  const dispatch = useAppDispatch();

  /**
   * When a user clicks the `Delete Account` button to permanently delete this account, it triggers/runs this method which
   * first prevents the default browser behaviour to refresh the page
   * and then makes a DELETE request to delete the user from the database.
   *
   * Then, the method removes the credentials (user properties and access) from the global store
   * and deletes all the previous state.
   *
   * (Finally, the method automatically redirects to the login page.)
   */
  async function handleDeleteAccount(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await deleteAccount({ userPassword: password }).unwrap();
    dispatch(removeCredentials());
    dispatch(apiSlice.util.resetApiState());
  }

  return (
    <Container className="my-4">
      <h1>Delete Account (action is permanent!)</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        {/**If an error occured, show the error message. The error message is defined on the server. */}
        {/* @ts-ignore */}
        {error && <p style={{ color: "red" }}>{error.data.error}</p>}

        <Button variant="primary" type="submit" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </Form>
    </Container>
  );
}

export default DeleteAccount;
