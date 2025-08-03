import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const approot = ReactDOM.createRoot(document.getElementById("root"));
approot.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);


