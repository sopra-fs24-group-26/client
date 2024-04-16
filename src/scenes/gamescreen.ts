import { ScreenHeight, ScreenWidth } from "core/main";
import { Nullable, int } from "definitions/utils";
import Phaser from "phaser";

export class GameScreen extends Phaser.Scene {
    private dragStart: Nullable<Phaser.Math.Vector2>;

    public constructor() {
        super("GameScreen");
        this.dragStart = null;
    }

    public create(): void {
        this.createWorld();
        this.createCameraDrag();
        this.scene.launch("GameUiScreen");
    }

    private createWorld(): void {
        for (let i: int = 0; i < 8; i++) {
            this.add.image(
                Math.random() * ScreenWidth,
                Math.random() * ScreenHeight,
                "share",
            );
        }
    }

    private createCameraDrag(): void {
        const dragArea: Phaser.GameObjects.Rectangle = this.add.rectangle(
            0,
            0,
            ScreenWidth,
            ScreenHeight,
            0x000000,
            0,
        );
        dragArea.setOrigin(0, 0);
        dragArea.setScrollFactor(0);
        dragArea.setInteractive();
        dragArea.on("pointermove", () => this.dragCamera());
    }

    private dragCamera(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        if (!activePointer.isDown) {
            this.dragStart = null;
            return;
        }
        if (this.dragStart) {
            const camera: Phaser.Cameras.Scene2D.Camera = this.cameras.main;
            camera.scrollX += this.dragStart.x - activePointer.position.x;
            camera.scrollY += this.dragStart.y - activePointer.position.y;
        }
        this.dragStart = activePointer.position.clone();
    }
}
