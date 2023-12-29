import Container from "react-bootstrap/Container";
import { useLazyGetAllCarsAdminPriviledgeQuery } from "../features/cars/carsApiSlice";
import Spinner from "react-bootstrap/Spinner";
import Car from "../components/Car";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FilterCheckbox from "../components/FilterCheckbox";
import { carBrands, fuels } from "../data/data";

/**
 *
 * @returns Admin page, which displays all the car notes data available to an admin.
 */
function HomeAdmin() {
  // use the `useLocation()` hook
  const location = useLocation();

  // use the `useLazyGetAllCarsAdminPriviledgeQuery()` to retreive data from the database (makes a GET request) on click
  const [fetchCars, { data: cars, isLoading, error }] =
    useLazyGetAllCarsAdminPriviledgeQuery();

  // check-boxes are not persistent --> when the component mounts(/loads), (for example on page refresh), clear all query params.
  const [queryParameters, setQueryParameters] = useSearchParams();
  useEffect(() => {
    setQueryParameters((previousQueryParameters) => {
      previousQueryParameters.delete("brand");
      previousQueryParameters.delete("fuel");
      return previousQueryParameters;
    });
  }, []);

  /**
   * Retreive the filtered cars from the server whenever the query parameters in the URL change
   */
  useEffect(() => {
    fetchCars(location.search).unwrap();
  }, [location.search]);

  // /**
  //  * When the user submits the form, the filtered data is retreived from the server.
  //  * @param e
  //  */
  // function handleFetchFilters(
  //   e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  // ) {
  //   e.preventDefault();
  //   fetchCars(location.search);
  // }

  // If there are cars,
  // show 1 car in a row on extra small screens and above.
  // show 2 cars in a row on medium screens and above.
  // show 3 cars in a row on large screens and above.
  return (
    <Container fluid>
      <Row>
        <Col>
          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label as="legend" column sm={4}>
                Brand
              </Form.Label>
              <Col sm={10}>
                {carBrands.map((carBrand, index) => (
                  <FilterCheckbox key={index} filter={carBrand} />
                ))}
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label as="legend" column sm={4}>
                Fuel
              </Form.Label>
              <Col sm={10}>
                {fuels.map((fuel, index) => (
                  <FilterCheckbox key={index} filter={fuel} />
                ))}
              </Col>
            </Form.Group>
            {/* <Button
              variant="primary"
              type="submit"
              onClick={handleFetchFilters}
            >
              Apply Filters
            </Button> */}
          </Form>
        </Col>
        {/* column takes 12 places of the screen (i.e. 100% of the screen) on extreme small screen sizes and above */}
        {/* column takes 8 places of the screen  on small screen sizes and above */}
        <Col xs={12} sm={8}>
          {error ? (
            <p style={{ color: "red" }} className="my-3">
              {/*  @ts-ignore */}
              {error.data.error}
            </p>
          ) : isLoading ? (
            <Spinner animation="border" />
          ) : cars && cars.length > 0 ? (
            <Row xs={1} md={2} lg={3}>
              {cars.map((car) => (
                <Car key={car.carId} car={car} />
              ))}
            </Row>
          ) : (
            <p className="my-3">No car notes.</p>
          )}
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}

export default HomeAdmin;
