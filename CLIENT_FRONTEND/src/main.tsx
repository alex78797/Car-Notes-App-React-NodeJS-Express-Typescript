import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// some redux-related imports
import { Provider } from "react-redux";
import { store } from "./app/store.ts";

// include bootstrap css styles
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
