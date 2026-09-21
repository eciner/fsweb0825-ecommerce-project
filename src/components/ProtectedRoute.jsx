import { Redirect, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { createElement } from "react";

export default function ProtectedRoute({ component: Component, ...rest }) {
  const user = useSelector((state) => state.client.user);
  const authInitialized = useSelector((state) => state.client.authInitialized);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!authInitialized) {
          return (
            <div className="flex min-h-80 items-center justify-center text-sm text-[#737373]">
              Checking session...
            </div>
          );
        }

        if (!user?.email) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: `${props.location.pathname}${props.location.search}`,
                },
              }}
            />
          );
        }

        return createElement(Component, props);
      }}
    />
  );
}
