import React, { useEffect, useState, useRef } from "react";
import {
  Redirect,
  RouteProps,
  Switch,
  Route,
  BrowserRouter,
} from "react-router-dom";

import "./App.css";

function getCookie(name: string) {
  for (let c of (document.cookie || "").split(";")) {
    let [m, k, v] = Array.from(c.trim().match(/(\w+)=(.*)/)!);
    if (m !== undefined && decodeURIComponent(k) === name) {
      return decodeURIComponent(v);
    }
  }
  return undefined;
}

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const [resolved, setResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const prevIsAuthenticated = usePrevious(isAuthenticated);
  useEffect(() => {
    const isAuthenticatedChanged =
      prevIsAuthenticated !== undefined &&
      isAuthenticated !== prevIsAuthenticated;

    // remember to handle the edge case of when a user is logged in, then 401's on the next request
    if (isAuthenticatedChanged && !isAuthenticated) {
      setResolved(false);
      return;
    }

    if (!resolved) {
      if (!isAuthenticated) {
        const cookie = getCookie("csrftoken");
        fetch("/auth/", {
          method: "GET",
          headers: {
            "X-CSRFToken": cookie ? cookie : "",
          },
          credentials: "same-origin",
        }).then(() => {
          setResolved(true);
        });
      } else {
        setResolved(true);
      }
    }
  }, [isAuthenticated, prevIsAuthenticated, resolved]);
  return !resolved ? null : (
    <Route
      {...rest}
      render={({ location }) => {
        if (isAuthenticated) {
          return children;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location },
              }}
            />
          );
        }
      }}
    />
  );
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cookie = getCookie("csrftoken");
    console.log("subbing", cookie);
    fetch("/auth/", {
      method: "POST",
      headers: {
        "X-CSRFToken": cookie ? cookie : "",
      },
      credentials: "same-origin",
      body: JSON.stringify({ username: username, password: password }),
    }).then((response) => {
      console.log("response");
      console.log(response);
    });
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
        ></input>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        ></input>
        <button type="submit">Log in</button>
      </form>
    </>
  );
};
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <PrivateRoute path="/">
          You are now logged in:
          <button onClick={() => {}}>Log out</button>
        </PrivateRoute>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
