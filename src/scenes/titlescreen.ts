import { float, Nullable } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";
import Image = Phaser.GameObjects.Image;

export class TitleScreen extends Phaser.Scene {
    private button: Nullable<Phaser.GameObjects.Image>;

    public constructor() {
        super("TitleScreen");
        this.button = null;
    }

    public preload(): void {
        this.load.image("createLobby", "assets/create.png");
        this.load.image("titlescreen", "assets/sabo.png");
    }

    public create(): void {
        this.add
            .rectangle(0, 0, ScreenWidth, ScreenHeight, 0x000000)
            .setOrigin(0);

        const backgroundImage: Image = this.add.image(
            ScreenWidth / 2,
            ScreenHeight / 2,
            "titlescreen",
        );

        const maxWidthScale: float = ScreenWidth / backgroundImage.width;
        const maxHeightScale: float = ScreenHeight / backgroundImage.height;
        const scale: float = Math.min(maxWidthScale, maxHeightScale);
        backgroundImage.setScale(scale);

        // Center the image
        backgroundImage.setPosition(ScreenWidth / 2, ScreenHeight / 2);

        this.button = this.add.image(
            ScreenWidth / 1.4,
            ScreenHeight / 1.1,
            "createLobby",
        );
        interactify(this.button, 0.2, () => this.onButton());
    }

    private async onButton(): Promise<void> {
        await SessionManager.createSession();
        this.scene.start("LobbyScreen");
    }
}
