import * as React from "react";
import "styles/index.scss";
import { StartGame, EventBus } from "./main";
import { Nullable } from "definitions/utils";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {}

export const PhaserGame = React.forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame(
        _props: IProps,
        ref: React.ForwardedRef<IRefPhaserGame>,
    ) {
        const game: React.MutableRefObject<Nullable<Phaser.Game>> =
            React.useRef<Nullable<Phaser.Game>>(null);

        React.useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame();

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null } as IRefPhaserGame);
                } else if (ref) {
                    ref.current = {
                        game: game.current,
                        scene: null,
                    } as IRefPhaserGame;
                }
            }

            return () => {
                if (!game.current) {
                    return;
                }
                game.current.destroy(true);
                if (game.current !== null) {
                    game.current = null;
                }
            };
        }, [ref]);

        React.useEffect(() => {
            EventBus.on(
                "current-scene-ready",
                (scene_instance: Phaser.Scene) => {
                    if (typeof ref === "function") {
                        ref({
                            game: game.current,
                            scene: scene_instance,
                        } as IRefPhaserGame);
                    } else if (ref) {
                        ref.current = {
                            game: game.current,
                            scene: scene_instance,
                        } as IRefPhaserGame;
                    }
                },
            );
            return () => {
                EventBus.removeListener("current-scene-ready");
            };
        }, [ref]);

        return <div id="game-container"></div>;
    },
);
