import { Nullable, UUID } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { log } from "utilities/logger";
import { interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";

export class TitleScreen extends Phaser.Scene {
    private text: Nullable<Phaser.GameObjects.Text>;
    private button: Nullable<Phaser.GameObjects.Image>;

    public constructor() {
        super("TitleScreen");
        this.text = null;
    }

    public preload(): void {
        this.load.image("createLobby", "create.png");
    }

    public init(): void {
        const listener: UUID = SessionManager.onSync.on(() =>
            log("session data synced"),
        );
        // on scene destroy free listener
        this.events.on("destroy", () => {
            SessionManager.onSync.off(listener);
        });
    }

    public create(): void {
        this.text = this.add
            .text(ScreenWidth / 2, ScreenHeight / 4, "Saboteur", {
                fontFamily: "Arial Black",
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
        log(this, this.text);
    }

    private async onButton(): Promise<void> {
        const sessionId: string = await SessionManager.createSession();
        this.input.stopPropagation();
        this.scene.start("LobbyScreen");
    }
}
