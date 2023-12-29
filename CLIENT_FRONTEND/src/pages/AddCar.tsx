import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";
import { useCreateCarMutation } from "../features/cars/carsApiSlice";

/**
 * 
 * @returns A page, where users can add a car note.
 */
function AddCar() {
  const [carProperties, setCarProperties] = useState({
    brand: "",
    model: "",
    fuel: "",
  });

  const navigate = useNavigate();

  const [addCar, { error }] = useCreateCarMutation();

  function handleChangeCarProperties(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    setCarProperties((previousCarProperties) => ({
      ...previousCarProperties,
      [e.target.name]: e.target.value,
    }));
  }

  /**
   * When a user clicks the `Add Car` button to add a car note to the database, it triggers/runs this method which
   * first prevents the default browser behaviour to refresh the page
   * and then makes a POST request to add the car note to the database.
   *
   * With RTK Query (Redux Toolkit Query), the cache tag is invalidated and the data is refetched / retreived automatically
   * from the database.
   *
   * Finally, the method redirects to the home page to see the car notes.
   */
  async function handleAddCar(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await addCar({
      model: carProperties.model,
      brand: carProperties.brand,
      fuel: carProperties.fuel,
    }).unwrap();
    navigate("/");
  }

  return (
    <Container className="my-5">
      <h1>Add Car</h1>
      <Form>
        <Form.Group className="mb-3 my-3" controlId="formBasicEmail">
          <Form.Label>Brand</Form.Label>
          <Form.Control
            type="text"
            placeholder="Brand,  for  example:  Porsche,  Audi,  BMW,  Mercedes,  Volkswagen,  Skoda"
            name="brand"
            onChange={handleChangeCarProperties}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Ḿodel</Form.Label>
          <Form.Control
            type="text"
            placeholder="Model,  for  example:  911  GT3RS  2022,  5  Series  2022"
            name="model"
            onChange={handleChangeCarProperties}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Fuel</Form.Label>
          <Form.Control
            type="text"
            placeholder="Fuel,  for  example:  Petrol,  7.5  liter  pro  100km  (do  not  use  ''/ '' )"
            name="fuel"
            onChange={handleChangeCarProperties}
          />
        </Form.Group>

        {error && (
          <p style={{ color: "red" }}>
            {/* @ts-ignore */}
            {error.data.error}: {error.data.emptyFields.join(" ")}
          </p>
        )}

        <Button variant="primary" type="submit" onClick={handleAddCar}>
          Add Car
        </Button>
      </Form>
    </Container>
  );
}

export default AddCar;
