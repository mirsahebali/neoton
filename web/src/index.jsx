/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.jsx";
import { Route, Router, useNavigate } from "@solidjs/router";
import HomeLayout from "./components/HomeLayout.jsx";
import About from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/404.jsx";
import { themeChange } from "theme-change";
import { onMount } from "solid-js";
import VerifyUser from "./pages/Verify.jsx";
import Chats from "./pages/Chats.jsx";
import Contacts from "./pages/Contacts.jsx";
import ChatsLayout from "./components/ChatsLayout.jsx";
import Calls from "./pages/Calls.jsx";
import Settings from "./pages/Settings.jsx";

const root = document.getElementById("root");

if (!root) throw new Error("root element not found");

onMount(() => themeChange());
render(
  () => (
    <Router>
      <Route path="/" component={HomeLayout}>
        <Route path="/" component={App} />
        <Route path="/about" component={About} />
      </Route>
      <Route path="/auth" component={HomeLayout}>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/verify" component={VerifyUser} />
      </Route>
      <Route path="/app" component={ChatsLayout}>
        <Route
          path="/"
          component={() => {
            useNavigate()("/app/chats");
            return <></>;
          }}
        />
        <Route path="/chats" component={Chats} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/calls" component={Calls} />
        <Route path="/settings" component={Settings} />
      </Route>
      <Route path="404" component={NotFound} />
    </Router>
  ),
  root,
);
