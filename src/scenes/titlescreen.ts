import { float, int, Nullable } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";
import { GameUiScreen } from "./gameuiscreen";

export class TitleScreen extends Phaser.Scene {
    public constructor() {
        super("TitleScreen");
    }

    public preload(): void {
        this.load.bitmapFont(
            "YosterIsland",
            "assets/fonts/YosterIslandRegBitmap.png",
            "assets/fonts/YosterIslandRegBitmap.fnt",
        );
        this.load.image("create", "assets/buttons/create.png");
        this.load.image("backdrop", "assets/sabo.png");
        this.load.image("quit1", "assets/buttons/quit1.png");
        this.load.image("quit2", "assets/buttons/quit2.png");
        for (let i: int = 0; i < 10; i++) {
            this.load.image(
                `avatar${i}`,
                `https://api.dicebear.com/8.x/pixel-art/svg?seed=${i}&size=${GameUiScreen.profilePixels}&beardProbability=0&glassesProbability=0&hat=variant01&hatColor=ad6d3e&skinColor=a26d3d,b68655`,
            );
        }
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
