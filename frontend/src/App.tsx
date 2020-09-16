import React, { useEffect, useState, useRef } from "react";
import {
  Redirect,
  RouteProps,
  Switch,
  Route,
  BrowserRouter,
  useHistory,
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
const check = async () => {
  const cookie = getCookie("csrftoken");
  const response = await fetch("/auth/", {
    method: "GET",
    headers: {
      "X-CSRFToken": cookie ? cookie : "",
    },
    credentials: "same-origin",
  });
  console.log("checking", response.ok);
  return response.ok;
};
const login = async (username: string, password: string) => {
  const cookie = getCookie("csrftoken");
  const data = new FormData();
  data.append("username", username);
  data.append("password", password);

  const response = await fetch("/auth/", {
    method: "POST",
    headers: {
      "X-CSRFToken": cookie ? cookie : "",
    },
    credentials: "same-origin",
    body: data,
  });
  return response.ok;
};

const logout = async () => {
  const cookie = getCookie("csrftoken");
  const response = await fetch("/auth/", {
    method: "DELETE",
    headers: {
      "X-CSRFToken": cookie ? cookie : "",
    },
    credentials: "same-origin",
  });
  return response.ok;
};

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
    const checkUser = async () => {
      setIsAuthenticated(await check());
    };

    const isAuthenticatedChanged =
      prevIsAuthenticated !== undefined &&
      isAuthenticated !== prevIsAuthenticated;

    // handle the edge case of when a user is logged in, then 401's on the next request
    if (isAuthenticatedChanged && !isAuthenticated) {
      setResolved(false);
      return;
    }

    if (!resolved) {
      if (!isAuthenticated) {
        checkUser().finally(() => {
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
  const history = useHistory();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password).then((val) => {
      if (val) history.push("/");
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
const Dashboard: React.FC = () => {
  const history = useHistory();
  return (
    <>
      You are now logged in:
      <button
        onClick={() => {
          logout().then((val) => {
            if (val) history.push("/login");
          });
        }}
      >
        Log out
      </button>
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
          <Dashboard />
        </PrivateRoute>
      </Switch>
    </BrowserRouter>
  );
}
export default App;
