import { float, Nullable } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";

export class TitleScreen extends Phaser.Scene {
    public constructor() {
        super("TitleScreen");
    }

    public preload(): void {
        this.load.image("create", "assets/buttons/create.png");
        this.load.image("backdrop", "assets/sabo.png");
    }

    public create(): void {
        const background: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth / 2,
            ScreenHeight / 2,
            "backdrop",
        );
        const maxWidthScale: float = ScreenWidth / background.width;
        const maxHeightScale: float = ScreenHeight / background.height;
        const scale: float = Math.max(maxWidthScale, maxHeightScale);
        background.setScale(scale);

        const button: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth / 1.4,
            ScreenHeight / 1.1,
            "create",
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
        await SessionManager.create();
        this.scene.start("LobbyScreen");
    }
}
