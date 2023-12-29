import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./authPages/Login";
import Register from "./authPages/Register";
import Home from "./pages/Home";
import EditCar from "./pages/EditCar";
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import PersistLogin from "./authComponents/PersistLogin";
import { PrivateOutlet } from "./authComponents/PrivateOutlet";
import AddCar from "./pages/AddCar";
import DeleteAccount from "./authPages/DeleteAccount";
import { PrivateOutletAdmin } from "./authComponents/PrivateOutletAdmin";
import HomeAdmin from "./pages/HomeAdmin";
import ResetPassword from "./authPages/ResetPassword";

/**
 *
 * @returns Component that defines the routes of the application
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<PersistLogin />}>
            <Route element={<PrivateOutlet />}>
              <Route index element={<Home />} />
              <Route path="edit/:id" element={<EditCar />} />
              <Route path="addCar" element={<AddCar />} />
              <Route path="deleteAccount" element={<DeleteAccount />} />
              <Route path="resetPassword" element={<ResetPassword />} />
              <Route element={<PrivateOutletAdmin />}>
                <Route path="admin" element={<HomeAdmin />} />
              </Route>
            </Route>
          </Route>
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
