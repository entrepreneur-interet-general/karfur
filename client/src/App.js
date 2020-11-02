import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import track from "react-tracking";
import { Spinner } from "reactstrap";
import IdleTimer from "react-idle-timer";
import uniqid from "uniqid";

import { store } from "./services/configureStore";
import PrivateRoute from "./components/PrivateRoute";
import { socket } from "./utils/API";
import { dispatch } from "./tracking/dispatch";
import "./i18n";

import "react-notifications/src/notifications.scss";
import "./App.scss";
import { ConnectedRouter } from "connected-react-router";
import { history } from "./services/configureStore";

const loading = () => (
  <div className="spinner-container">
    <Spinner color="success" className="waiting-spinner" />
  </div>
);

const LayoutComponent = React.lazy(() => import("./containers/Layout/Layout"));

const Layout = (props) => (
  <React.Suspense fallback={loading()}>
    <LayoutComponent {...props} />
  </React.Suspense>
);

const LoginComponent = React.lazy(() => import("./containers/Login/Login"));

const Login = (props) => (
  <React.Suspense fallback={loading()}>
    <LoginComponent {...props} />
  </React.Suspense>
);

const RegisterComponent = React.lazy(() =>
  import("./containers/Register/Register")
);

const Register = (props) => (
  <React.Suspense fallback={loading()}>
    <RegisterComponent {...props} />
  </React.Suspense>
);

const Page404Component = React.lazy(() => import("./views/Pages/Page404"));

const Page404 = (props) => (
  <React.Suspense fallback={loading()}>
    <Page404Component {...props} />
  </React.Suspense>
);

const Page500Component = React.lazy(() => import("./views/Pages/Page500"));

const Page500 = (props) => (
  <React.Suspense fallback={loading()}>
    <Page500Component {...props} />
  </React.Suspense>
);

const ResetComponent = React.lazy(() => import("./containers/Reset/Reset"));

const Reset = (props) => (
  <React.Suspense fallback={loading()}>
    <ResetComponent {...props} />
  </React.Suspense>
);

const mountId = uniqid("mount_");

class App extends Component {
  state = { data: {} };
  idleTimer = null;

  componentDidMount() {
    //On désactive les logs en prod
    if (process.env.NODE_ENV === "production") {
      // eslint-disable-next-line no-console
      console.log = function () {};
    }

    //On track le chargement et déchargement de la page
    window.onbeforeunload = function () {
      this.props.tracking.trackEvent({
        action: "unmount",
        label: "App",
        value: mountId,
      });
      return undefined;
    }.bind(this);
    this.props.tracking.trackEvent({
      action: "mount",
      label: "App",
      value: mountId,
    });

    //On charge Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "74e04b98-ef6b-4cb0-9daf-f8a2b643e121";
    (function () {
      let d = document;
      let s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();

    window.scrollTo(0, 0);
  }

  _onActive = () =>
    this.props.tracking.trackEvent({
      action: "active",
      label: "App",
      value: mountId,
    });

  _onIdle = () =>
    this.props.tracking.trackEvent({
      action: "idle",
      label: "App",
      value: mountId,
      time: this.idleTimer.getLastActiveTime(),
    });

  socketFn = {
    sendMessage: this.sendMessage,
  };

  render() {
    return (
      <Provider store={store}>
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          element={document}
          onActive={this._onActive}
          onIdle={this._onIdle}
          // onAction={this._onAction}
          // debounce={250}
          timeout={1000 * 60 * 5}
        />
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/login" name="Login Page" component={Login} />
            <Route
              exact
              path="/register"
              name="Register Page"
              component={Register}
            />
            <Route exact path="/404" name="Page 404" component={Page404} />
            <Route exact path="/500" name="Page 500" component={Page500} />
            <Route
              exact
              path="/reset/:id"
              name="Reset Page"
              component={Reset}
            />
            <PrivateRoute
              path="/"
              component={Layout}
              socket={socket}
              socketFn={this.socketFn}
            />
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default track(
  {
    app: "App",
  },
  {
    dispatch: dispatch,
    dispatchOnMount: true,
    process: (ownTrackingData) => (ownTrackingData.page ? true : null),
  }
)(App);
