import { Nullable, UUID } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";

export class TitleScreen extends Phaser.Scene {
    private title: Nullable<Phaser.GameObjects.Text>;
    private button: Nullable<Phaser.GameObjects.Image>;

    public constructor() {
        super("TitleScreen");
        this.title = null;
        this.button = null;
    }

    public preload(): void {
        this.load.image("createLobby", "assets/create.png");
    }

    public create(): void {
        this.title = this.add
            .text(ScreenWidth / 2, ScreenHeight / 4, "Saboteur", {
                font: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);
        this.button = this.add.image(
            ScreenWidth / 2,
            ScreenHeight / 1.5,
            "createLobby",
        );
        interactify(this.button, 0.2, () => this.onButton());
    }

    private async onButton(): Promise<void> {
        await SessionManager.createSession();
        this.scene.start("LobbyScreen");
    }
}
