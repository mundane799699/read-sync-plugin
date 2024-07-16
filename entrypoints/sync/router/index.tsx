import Home from "../pages/Home";
import Login from "../pages/Login";
import About from "../pages/About";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default routes;
