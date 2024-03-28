import { Nullable } from "definitions/utils";
import * as React from "react";
import "styles/index.scss";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

const App: React.FC = () => {
    const phaserRef: React.MutableRefObject<Nullable<IRefPhaserGame>> =
        React.useRef<Nullable<IRefPhaserGame>>(null);

    return (
        <div>
            <PhaserGame ref={phaserRef} />
        </div>
    );
};

export default App;
