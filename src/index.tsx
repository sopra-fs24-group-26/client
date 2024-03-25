import "./styles/index.scss";
import { Nullable } from "definitions/utils";
import { assert } from "utilities/utils";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "core/App";

const container: Nullable<HTMLElement> = document.getElementById("app");
assert(container);

const root: ReactDOM.Root = ReactDOM.createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
