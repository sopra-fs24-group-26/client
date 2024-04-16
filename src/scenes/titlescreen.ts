import { Nullable } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";

export class TitleScreen extends Phaser.Scene {
    public constructor() {
        super("TitleScreen");
    }

    public preload(): void {
        this.load.image("createLobby", "assets/create.png");
    }

    public create(): void {
        this.add
            .text(ScreenWidth / 2, ScreenHeight / 4, "Saboteur", {
                font: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);

        const button: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth / 2,
            ScreenHeight / 1.5,
            "createLobby",
        );
        interactify(button, 0.5, () => this.onButton());

        this.portToCorrectScene();
    }

    private portToCorrectScene(): void {
        SessionManager.onSync.once(() => {
            const hasStarted: Nullable<boolean> = SessionManager.hasStarted();
            if (hasStarted === null) {
                return;
            }
            if (hasStarted === false) {
                this.scene.start("LobbyScreen");
                return;
            }
            this.scene.start("GameScreen");
        });
    }

    private async onButton(): Promise<void> {
        await SessionManager.createSession();
        this.scene.start("LobbyScreen");
    }
}
