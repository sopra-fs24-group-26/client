import { ScreenHeight, ScreenWidth } from "core/main";
import { Nullable, UUID, int } from "definitions/utils";
import { Tile } from "entities/Tile";
import TileManager from "managers/TileManager";
import Phaser from "phaser";
import { assert } from "utilities/utils";

export class GameScreen extends Phaser.Scene {
    private dragStart: Nullable<Phaser.Math.Vector2>;
    private placedTilesContainer: Nullable<Phaser.GameObjects.Container>;
    private static tilePixels: int = 128;

    public constructor() {
        super("GameScreen");
        this.dragStart = null;
        this.placedTilesContainer = null;
    }

    public init(): void {
        const tileUpdateListener: UUID = TileManager.onSync.on(() => {
            this.displayPlacedTiles();
        });
        this.events.on("destroy", () => {
            TileManager.onSync.off(tileUpdateListener);
        });
    }

    public preload(): void {
        for (let i: int = 0; i < 12; i++) {
            this.load.image(`tile${i}`, `assets/tiles/tile${i}.png`);
        }
    }

    public create(): void {
        this.createWorld();
        this.createCameraDrag();
        this.scene.launch("GameUiScreen");
    }

    private createWorld(): void {
        this.placedTilesContainer = this.add.container();
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

            this.events.emit("cameraViewportChanged", {
                x: camera.scrollX,
                y: camera.scrollY,
            });
        }
        this.dragStart = activePointer.position.clone();
    }

    private displayPlacedTiles(): void {
        TileManager.updateAdjacencyMap();
        assert(this.placedTilesContainer);
        this.placedTilesContainer.removeAll(true);

        const placedTiles: Nullable<Tile[]> = TileManager.getPlaced();
        assert(this.placedTilesContainer && placedTiles);
        this.placedTilesContainer.removeAll(true);

        const preplacedTiles: Tile[] = TileManager.getPreplaced();
        const allTiles: Tile[] = [...placedTiles, ...preplacedTiles];
        
        allTiles.forEach((tile: Tile) => {
            if (tile.coordinateX !== null && tile.coordinateY !== null) {
                assert(this.placedTilesContainer);
                this.placedTilesContainer.add(
                    this.add
                        .image(
                            tile.coordinateX * GameScreen.tilePixels,
                            tile.coordinateY * GameScreen.tilePixels,
                            `tile${tile.type}`,
                        )
                        .setAngle(tile.rotation * 90),
                );
            }
        });
    }
}
