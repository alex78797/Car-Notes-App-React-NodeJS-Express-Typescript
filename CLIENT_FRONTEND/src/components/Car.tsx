import { ICar } from "../types/types";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import {
  useDeleteCarAdminPriviledgeMutation,
  useDeleteCarMutation,
} from "../features/cars/carsApiSlice";
import { useAppSelector } from "../app/hooks";

/**
 *
 * @param car a car object / an object with the properties of a car
 * @returns A component which displays properties of a car.
 */
function Car({ car }: { car: ICar }) {
  const navigate = useNavigate();

  const [deleteCar, { error: regularUserError }] = useDeleteCarMutation();
  const [deleteCarAdminPriviledge, { error: adminError }] =
    useDeleteCarAdminPriviledgeMutation();

  const currentUser = useAppSelector((state) => state.auth.user);

  /**
   * When a user clicks the `Edit` button to edit a car note, it triggers/runs this method which
   * first prevents the default browser behaviour to refresh the page
   * and then redirects to the page where a user can edit the car note.
   */
  function handleGoToEditCarPage(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    navigate(`edit/${car.carId}`);
  }

  /**
   * When a user clicks the `Delete` button to delete a car note, it triggers/runs this method which
   * first prevents the default browser behaviour to refresh the page
   * and then makes a DELETE request to delete the car note from the database.
   *
   * With RTK Query (Redux Toolkit Query), the cache tag is invalidated and the data is refetched / retreived automatically
   * from the database.
   *
   */
  async function handleDeleteCar(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await deleteCar(car.carId).unwrap();
  }

  /**
   * When a user clicks the `Delete` button to delete a car note, it triggers/runs this method which
   * first prevents the default browser behaviour to refresh the page
   * and then makes a DELETE request to delete the car note from the database.
   *
   * With RTK Query (Redux Toolkit Query), the cache tag is invalidated and the data is refetched / retreived automatically
   * from the database.
   *
   */
  async function handleDeleteCarAdminPriviledge(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await deleteCarAdminPriviledge(car.carId).unwrap();
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>{car.model}</Card.Title>
        <Card.Text>{car.brand}</Card.Text>
        <Card.Text>{car.fuel}</Card.Text>
        {currentUser?.roles.includes("admin") && (
          <Card.Text>User ID: {car.userId}</Card.Text>
        )}
        <Button
          variant="primary"
          onClick={handleGoToEditCarPage}
          style={{ marginRight: "9px" }}
        >
          Edit
        </Button>

        {!currentUser?.roles.includes("admin") ? (
          <Button
            variant="danger"
            onClick={handleDeleteCar}
            style={{ marginRight: "9px" }}
          >
            Delete
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={handleDeleteCarAdminPriviledge}
            style={{ marginRight: "9px" }}
          >
            Delete
          </Button>
        )}

        {regularUserError && (
          <p style={{ color: "red" }}>
            {/* @ts-ignore */}
            {regularUserError.data.error}
          </p>
        )}

        {adminError && (
          <p style={{ color: "red" }}>
            {/* @ts-ignore */}
            {adminError.data.error}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

export default Car;
