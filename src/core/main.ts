import Phaser from "phaser";
import { TitleScreen } from "scenes/titlescreen";
import { LobbyScreen } from "scenes/lobbyscreen";
import { int } from "../definitions/utils";
import SessionManager from "managers/SessionManager";
import PlayerManager from "managers/PlayerManager";
import GeneralManager from "managers/GeneralManager";
import TileManager from "managers/TileManager";
import { GameScreen } from "scenes/gamescreen";
import { GameUiScreen } from "scenes/gameuiscreen";
import { EndScreen } from "scenes/endscreen";

export const ScreenWidth: int = document.body.clientWidth;
export const ScreenHeight: int = document.body.clientHeight;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: ScreenWidth,
    height: ScreenHeight,
    parent: "game-container",
    backgroundColor: "#463a40",
    scene: [TitleScreen, LobbyScreen, GameScreen, GameUiScreen, EndScreen],
    pixelArt: true,
    roundPixels: true
};
export const EventBus: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

export const StartGame = () => new Phaser.Game(config);

GeneralManager.initialize();
SessionManager.initialize();
PlayerManager.initialize();
TileManager.initialize();
