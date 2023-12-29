import { ICar } from "../types/types";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { useUpdateCarMutation } from "../features/cars/carsApiSlice";
import Container from "react-bootstrap/Container";

/**
 *
 * @param car The properties of the car before the update
 * @returns Component that returns the form with which the user can update its car
 */
function EditCarForm({ car }: { car: ICar }) {
  const [carProperties, setCarProperties] = useState({
    brand: car.brand,
    model: car.model,
    fuel: car.fuel,
  });

  const navigate = useNavigate();

  const [updateCar, { error }] = useUpdateCarMutation();

  function handleChangeCarProperties(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    setCarProperties({
      // Copy all previous state values of the carProperties object.
      // (spread opertor `...` does not work for nested objects --> additional "spreading" or "flattening" is required)
      ...carProperties,
      // Out of all properties (array) of the carProperties object,
      // update the value of the property with the given name
      // with the value the user entered in the input field (here Form.Control from Bootstrap / React Bootstrap).
      // The name of the input field must match the name of the property in the carProperties object.
      [e.target.name]: e.target.value,
    });
  }

  /**
   * When a user clicks the `Edit` button to edit a car note, it triggers/runs this method which
   * first prevents the default browser behaviour to refresh the page
   * and then makes a PUT request to edit the car note in the database.
   *
   * With RTK Query (Redux Toolkit Query), the cache tag is invalidated and the data is refetched / retreived automatically
   * from the database.
   *
   * Finally, the method redirects the user to the home page to see the car notes.
   */
  async function handleEditCar(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await updateCar({
      model: carProperties.model,
      brand: carProperties.brand,
      fuel: carProperties.fuel,
      carId: car.carId,
    }).unwrap();
    navigate("/");
  }

  return (
    <Container className="my-5">
      <h1>Edit Car</h1>
      <Form>
        <Form.Group className="mb-3 my-3" controlId="formBasicEmail">
          <Form.Label>Brand</Form.Label>
          <Form.Control
            type="text"
            name="brand"
            value={carProperties.brand}
            onChange={handleChangeCarProperties}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Ḿodel</Form.Label>
          <Form.Control
            type="text"
            name="model"
            value={carProperties.model}
            onChange={handleChangeCarProperties}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Fuel</Form.Label>
          <Form.Control
            type="text"
            name="fuel"
            value={carProperties.fuel}
            onChange={handleChangeCarProperties}
          />
        </Form.Group>

        {/**If an error occured, show the error message. The error message is defined on the server. */}
        {error && (
          <p style={{ color: "red" }}>
            {/* @ts-ignore */}
            {error.data.error}: {error.data.emptyFields.join(" ")}
          </p>
        )}

        <Button variant="primary" type="submit" onClick={handleEditCar}>
          Edit Car
        </Button>
      </Form>
    </Container>
  );
}

export default EditCarForm;
