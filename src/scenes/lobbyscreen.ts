import { Nullable } from "definitions/utils";
import Phaser from "phaser";
import { log } from "utilities/logger";
import { ScreenHeight, ScreenWidth } from "../core/main";

export class LobbyScreen extends Phaser.Scene {
    private text: Nullable<Phaser.GameObjects.Text>;

    public constructor() {
        super("LobbyScreen");
        this.text = null;
    }

    public create(): void {
        this.text = this.add
            .text(ScreenWidth / 2, ScreenHeight / 4, "Lobby", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);
        log(this, this.text);
    }
}
