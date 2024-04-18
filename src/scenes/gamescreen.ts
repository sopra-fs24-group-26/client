import { ScreenHeight, ScreenWidth } from "core/main";
import { SessionDTO } from "definitions/dto";
import { Nullable, UUID, int } from "definitions/utils";
import { Tile } from "entities/Tile";
import GeneralManager from "managers/GeneralManager";
import SessionManager from "managers/SessionManager";
import TileManager from "managers/TileManager";
import Phaser from "phaser";
import seedrandom from "seedrandom";
import { assert, interactify } from "utilities/utils";

export class GameScreen extends Phaser.Scene {
    private dragStart: Nullable<Phaser.Math.Vector2>;
    private placedTilesContainer: Nullable<Phaser.GameObjects.Container>;
    private static tilePixels: int = 128;

    private testingPlacedTiles: Nullable<Tile[]>; //test
    static testingCount: int = 1; //test

    public constructor() {
        super("GameScreen");
        this.dragStart = null;
        this.placedTilesContainer = null;
        this.testingPlacedTiles = null; //test
    }

    /**
     * Gamescreen continuously listens to TileManager\
     * Whenever there is a change in tile information, this means someone has made a move\
     * Call displayPlacedTiles() to get updated view\
     * The event listener is freed from memory on destroy scene event
     *
     * Can be extended to do more things when tile info changes
     */
    public init(): void {
        const tileUpdateListener: UUID = TileManager.onSync.on(() => {
            this.displayPlacedTiles();
        });
        // on scene destroy free listener
        this.events.on("destroy", () => {
            TileManager.onSync.off(tileUpdateListener);
        });
    }

    public preload(): void {
        for (let i: int = 0; i < 9; i++) {
            this.load.image(`tile${i}`, `assets/tiles/tile${i}.png`);
        }
    }

    public create(): void {
        this.createWorld();
        this.createCameraDrag();
        this.scene.launch("GameUiScreen");
        this.placedTilesContainer = this.add.container();
    }

    /**
     * Temporary: Create three tiles on top of screen that represent the goal tiles\
     * Need to add starting tile and correct positioning
     */
    private createWorld(): void {
        for (let i: int = 0; i < 3; i++) {
            this.add.image((2 + i * 2) * 128, 0, `tile${8}`);
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

    /**
     * Mock function for testing purpose
     *
     * When clicking on the test button on top left corner, it simulates that a new tile is placed.\
     * The tiles are placed one next to each other
     *
     * @returns nothing, but updates the local array that holds every placed tiles
     */
    private mockTileInfoChange(): void {
        if (!this.testingPlacedTiles) {
            this.testingPlacedTiles = [];
        }
        assert(this.testingPlacedTiles && SessionManager.get());
        const session: Nullable<SessionDTO> = GeneralManager.getSession();
        assert(session);
        const random: seedrandom.PRNG = seedrandom(session.seed);
        const newTile: Tile = new Tile(
            random,
            (GameScreen.testingCount - 1) % 9,
        );
        newTile.coordinateX = GameScreen.testingCount;
        GameScreen.testingCount++;
        newTile.coordinateY = 2;
        this.testingPlacedTiles.push(newTile);
        this.displayPlacedTiles();
    }

    /**
     * All tiles are kept in a placedTilesContainer.\
     * To update display, first remove all existing images, then create new ones using placed tiles from Tilemanager\
     *
     * Whenever information about tiles is updated, it calls a list of placed tiles from TileManager
     *
     * Add the image at coordinate * pixels
     *
     * @returns void
     */
    private displayPlacedTiles(): void {
        assert(this.placedTilesContainer);
        this.placedTilesContainer.removeAll(true);

        // official
        const placedTiles: Nullable<Tile[]> = TileManager.getPlaced();

        // test - remove comment here and comment out line under //official
        // const placedTiles: Nullable<Tile[]> = this.testingPlacedTiles;

        if (!placedTiles) {
            return;
        }
        assert(placedTiles);
        // this arrow function is only called in for loop, so should share same scope as displayedPlacedTiles()
        placedTiles.forEach((tile) => {
            assert(
                tile.coordinateX &&
                    tile.coordinateY &&
                    this.placedTilesContainer,
            );
            // x, y coordinate correspond to the coordinate of the center of an image
            this.placedTilesContainer.add(
                this.add.image(
                    tile.coordinateX * GameScreen.tilePixels,
                    tile.coordinateY * GameScreen.tilePixels,
                    `tile${tile.type}`,
                ),
            );
        });
    }
}
