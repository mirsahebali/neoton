/* @refresh reload */
import { render } from "solid-js/web";
import Home from "./Home.jsx";
import { Route, Router } from "@solidjs/router";
import Layout from "./Layout.jsx";
import "./index.css";

const root = document.getElementById("root");

if (!root) throw new Error("root element not found");

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
    </Router>
  ),
  root,
);
