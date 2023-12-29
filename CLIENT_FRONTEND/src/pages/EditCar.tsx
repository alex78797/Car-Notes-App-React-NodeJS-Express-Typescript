import Container from "react-bootstrap/Container";
import { useLocation } from "react-router-dom";
import { useGetCarQuery } from "../features/cars/carsApiSlice";
import Spinner from "react-bootstrap/Spinner";
import EditCarForm from "../components/EditCarForm";

/**
 *
 * @returns A page, where the user can edit a car note.
 */
function EditCar() {
  const location = useLocation();
  // console.log(location)  // Object { pathname: "/edit/66d4ee1b-4fcf-4aa9-8155-0032394ab1ef", search: "", hash: "", state: null, key: "qwwx90kh" }

  const carId = location.pathname.split("/")[2];

  const { data: car, error, isLoading } = useGetCarQuery(carId);

  if (error) {
    return (
      <p style={{ color: "red" }} className="my-3">
        {/*  @ts-ignore */}
        {error.data.error}
      </p>
    );
  }

  if (isLoading || !car) {
    return (
      <Container className="d-flex min-vh-100 justify-content-center align-items-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return <EditCarForm car={car} />;
}

export default EditCar;
