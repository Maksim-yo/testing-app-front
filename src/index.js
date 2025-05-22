import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./routes/App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store"; // путь до store
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useEffect } from "react";

// const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const PUBLISHABLE_KEY =
  "pk_test_cHJvYmFibGUtZWdyZXQtMzQuY2xlcmsuYWNjb3VudHMuZGV2JA";
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
// const FRONTED_API = process.env.REACT_CLERK_FRONTED_API_URL;
const FRONTED_API = "https://probable-egret-34.clerk.accounts.dev";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ClerkProvider
      frontendApi={FRONTED_API}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
