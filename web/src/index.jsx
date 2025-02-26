/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import "./fonts.css";
import About from "./components/About.jsx";
import LogInPage from "./components/LogInPage.jsx";

import { A, Route, Router } from "@solidjs/router";
import AppLayout from "./components/Layout.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import SignUpPage from "./components/SignUpPage.jsx";

const root = document.getElementById("root");

// TODO: change this to take actual authentication boolean
const isAuthenticated = false;

if (!root) throw new Error("Could not find root element");

let layout;

if (isAuthenticated) layout = AppLayout;
else layout = AuthLayout;

render(
  () => (
    <Router root={layout}>
      <Route
        path="/"
        component={() => (
          <div>
            <div class="text-2xl"> Hello </div>
            <A href="/about" class="text-xl">
              Go to About
            </A>

            <A href="/login" class="text-xl">
              Go to Login
            </A>
          </div>
        )}
      />
      <Route path="/about" component={About} />
      <Route path="/login" component={LogInPage} />
      <Route path="/signup" component={SignUpPage} />
    </Router>
  ),
  root,
);
