/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.jsx";
import { Route, Router } from "@solidjs/router";
import HomeLayout from "./components/HomeLayout.jsx";
import About from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/404.jsx";
import { themeChange } from "theme-change";
import { onMount } from "solid-js";
import Chats from "./pages/Chats.jsx";

const root = document.getElementById("root");

if (!root) throw new Error("root element not found");

onMount(() => themeChange());
render(
  () => (
    <Router root={HomeLayout}>
      <Route path="/" component={App} />
      <Route path="/chats" component={Chats} />
      <Route path="/about" component={About} />
      <Route path="/auth">
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Route>
      <Route path="404" component={NotFound} />
    </Router>
  ),
  root,
);
