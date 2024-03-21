import App from "App";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

it("renders without crashing", () => {
    const container: HTMLDivElement = document.createElement("div");
    const root: ReactDOM.Root = ReactDOM.createRoot(container);
    root.render(<App />);
    root.unmount();
});
