import "./App.css";
import { useRoutes } from "react-router-dom";
import routes from "./router";

const App = () => {
  return <div>{useRoutes(routes)}</div>;
};

export default App;
