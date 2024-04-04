import { Nullable } from "definitions/utils";
import Phaser from "phaser";
import { log } from "utilities/logger";

export class LobbyScreen extends Phaser.Scene {
    private text: Nullable<Phaser.GameObjects.Text>;
    private clientW: number;
    private clientH: number;

    public constructor() {
        super("LobbyScreen");
        this.text = null;
        this.clientW = document.body.clientWidth;
        this.clientH = document.body.clientHeight;
    }

    public create(): void {
        this.text = this.add
            .text(this.clientW / 2, this.clientH / 4, "Lobby", {
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
