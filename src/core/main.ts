import Phaser from "phaser";
import { TitleScreen } from "scenes/titlescreen";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [TitleScreen],
};

export const StartGame = () => new Phaser.Game(config);
