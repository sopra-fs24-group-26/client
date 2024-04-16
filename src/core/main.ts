import Phaser from "phaser";
import { TitleScreen } from "scenes/titlescreen";
import { LobbyScreen } from "scenes/lobbyscreen";
import { int } from "../definitions/utils";

export const ScreenWidth: int = document.body.clientWidth;
export const ScreenHeight: int = document.body.clientHeight;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: ScreenWidth,
    height: ScreenHeight,
    parent: "game-container",
    backgroundColor: "black",
    scene: [TitleScreen, LobbyScreen],
};

export const EventBus: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

export const StartGame = () => new Phaser.Game(config);
