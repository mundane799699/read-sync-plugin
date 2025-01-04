import Home from "../pages/Home";
import Login from "../pages/Login";
import Review from "../pages/Review";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/review",
    element: <Review />,
  },
];

export default routes;
