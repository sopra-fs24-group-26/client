import Phaser from "phaser";
import { TitleScreen } from "scenes/titlescreen";
import { LobbyScreen } from "scenes/lobbyscreen";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: document.body.clientWidth,
    height: document.body.clientHeight,
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [TitleScreen, LobbyScreen],
};

export const EventBus: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

export const StartGame = () => new Phaser.Game(config);
