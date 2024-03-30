import { Nullable, UUID } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { log } from "utilities/logger";

export class TitleScreen extends Phaser.Scene {
    private text: Nullable<Phaser.GameObjects.Text>;

    public constructor() {
        super("TitleScreen");
        this.text = null;
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
            .text(400, 300, "Saboteur", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);
        //log(this, this.text);
    }
}
