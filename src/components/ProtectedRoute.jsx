import { Redirect, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createElement } from "react";
import { verifyStoredSession } from "../store/actions";

export default function ProtectedRoute({ component: Component, ...rest }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.client.user);
  const authInitialized = useSelector((state) => state.client.authInitialized);
  const authVerificationError = useSelector((state) => state.client.authVerificationError);

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

        if (authVerificationError) {
          return (
            <div role="alert" className="flex min-h-80 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-[#737373]">
              <p>We could not verify your session. Your saved login is still available.</p>
              <button
                type="button"
                className="font-semibold text-[#23A6F0]"
                onClick={() => dispatch(verifyStoredSession())}
              >
                Retry verification
              </button>
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
