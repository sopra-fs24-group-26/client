import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { log } from "utilities/logger";
import { interactify } from "utilities/utils";

export class GameUiScreen extends Phaser.Scene {
    public constructor() {
        super("GameUiScreen");
    }

    public preload(): void {
        this.load.image("start", "assets/buttons/start.png");
    }

    public create(): void {
        const back: Phaser.GameObjects.Rectangle = this.add.rectangle(
            ScreenWidth / 2,
            ScreenHeight - 100,
            ScreenWidth * 0.8,
            200,
            0xffffff,
        );
        back.setInteractive();

        const button: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth / 2,
            ScreenHeight - 100,
            "start",
        );
        interactify(button, 0.5, () => log("button"));
    }
}
