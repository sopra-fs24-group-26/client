import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { assert } from "utilities/utils";
import { PlaceTile } from "../definitions/placeTile";
import { int, Nullable } from "../definitions/utils";
import { Tile } from "../entities/Tile";
import TileManager from "../managers/TileManager";
import SessionManager from "../managers/SessionManager";
import { AdjacencyMap } from "../utilities/AdjacencyMap";

export class GameUiScreen extends Phaser.Scene {
    private static tilePixels: int = 128;
    private uiBackground: Nullable<Phaser.GameObjects.Rectangle>;
    private drawnTilesContainer: Nullable<Phaser.GameObjects.Container>;
    private topLeftX: int;
    private topLeftY: int;
    private dragObj: Nullable<Phaser.GameObjects.Image>;
    private currentTile: PlaceTile;
    private originalLocations: { [key: string]: [int, int] };
    private displayedTiles: [Phaser.GameObjects.Image, string, int][];
    private wrongText: Nullable<Phaser.GameObjects.Text>;
    private isDraging: boolean;

    public constructor() {
        super("GameUiScreen");
        this.uiBackground = null;
        this.drawnTilesContainer = null;
        this.topLeftX = 0;
        this.topLeftY = 0;
        this.dragObj = null;
        this.currentTile = new PlaceTile();
        this.originalLocations = {};
        this.displayedTiles = [];
        this.wrongText = null;
        this.isDraging = false;
    }

    public init(): void {
        /* const tileUpdateListener: UUID = TileManager.onSync.on(() => {
             this.displayDrawnTiles();
         });
         this.events.on("destroy", () => {
             TileManager.onSync.off(tileUpdateListener);
         });
         */
    }

    public preload(): void {
        for (let i: int = 0; i < 9; i++) {
            this.load.image(`tile${i}`, `assets/tiles/tile${i}.png`);
        }
    }

    public create(): void {
        const isMyTurn: boolean = SessionManager.isMyTurn();
        this.uiBackground = this.add.rectangle(
            ScreenWidth / 2,
            ScreenHeight - 100,
            ScreenWidth * 0.8,
            200,
            0x808080,
        );
        this.uiBackground.setInteractive();
        this.drawnTilesContainer = this.add.container();
        this.scene
            .get("GameScreen")
            .events.on(
                "cameraViewportChanged",
                this.handleViewportChange,
                this,
            );
        assert(this.input.keyboard);
        this.input.keyboard.on("keydown-LEFT", () => {
            if (this.dragObj) {
                this.dragObj.angle += -90;
                this.currentTile.rotation = (this.currentTile.rotation - 1) % 4;
            }
        });
        this.input.keyboard.on("keydown-RIGHT", () => {
            if (this.dragObj) {
                this.dragObj.angle += 90;
                this.currentTile.rotation = (this.currentTile.rotation + 1) % 4;
            }
        });
        this.events.on(
            "cameraViewportChanged",
            this.handleViewportChange,
            this,
        );
        this.displayDrawnTiles();
        isMyTurn
            ? this.setAllTilesInteractive()
            : this.setAllTileNotInteractive();
    }

    public displayDrawnTiles(): void {
        assert(this.drawnTilesContainer);
        this.drawnTilesContainer.removeAll(true);
        const myTiles: Nullable<Tile[]> = TileManager.getInHand();
        assert(myTiles && this.uiBackground);
        const nrTiles: int = myTiles.length;
        const tileSpacing: int =
            (this.uiBackground.width - nrTiles * GameUiScreen.tilePixels) /
            (nrTiles + 1);
        (this.uiBackground.width - nrTiles * 128) / (nrTiles + 1);

        for (let i: int = 0; i < nrTiles; i++) {
            const tile: Phaser.GameObjects.Image = this.add.image(
                this.uiBackground.getTopLeft().x +
                    (tileSpacing + GameUiScreen.tilePixels / 2) +
                    i * (GameUiScreen.tilePixels + tileSpacing),
                ScreenHeight - 100,
                `tile${myTiles[i].type}`,
            );
            tile.setInteractive();
            this.displayedTiles.push([
                tile,
                myTiles[i].id.toString(),
                myTiles[i].type,
            ]);
            this.originalLocations[myTiles[i].id.toString()] = [tile.x, tile.y];
            this.drawnTilesContainer.add(tile);
        }
    }

    private toggleDrag(): void {
        if (!this.isDraging && this.dragObj) {
            if (this.wrongText) this.wrongText.destroy();
            this.dragObj.on("pointermove", this.doDrag, this);
            this.dragObj.on("pointerdown", this.stopDrag, this);
            this.dragObj.on("pointerout", this.doDrag, this);
            this.isDraging = true;
        } else if (this.dragObj) {
            this.dragObj.off("pointermove", this.doDrag, this);
            this.dragObj.off("pointerdown", this.stopDrag, this);
            this.dragObj.off("pointerout", this.doDrag, this);
            this.isDraging = false;
        }
    }

    private doDrag(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        assert(this.uiBackground);
        if (this.dragObj) {
            this.dragObj.setDepth(6);
            if (
                activePointer.y < this.uiBackground.getTopLeft().y &&
                this.checkAdjacency([activePointer.x, activePointer.y])
            ) {
                this.dragObj.x = Phaser.Math.Snap.To(
                    activePointer.x,
                    GameUiScreen.tilePixels,
                    -this.topLeftX,
                );
                this.dragObj.y = Phaser.Math.Snap.To(
                    activePointer.y,
                    GameUiScreen.tilePixels,
                    -this.topLeftY,
                );
            } else {
                this.dragObj.x = activePointer.x;
                this.dragObj.y = activePointer.y;
            }
        }
    }

    private stopDrag(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        assert(this.uiBackground);
        if (this.dragObj && this.currentTile) {
            if (
                !this.checkAdjacency([activePointer.x, activePointer.y]) ||
                activePointer.y > this.uiBackground.getTopLeft().y
            ) {
                this.setBackToOriginalPosition(true);
            } else if (
                !this.checkConnections([activePointer.x, activePointer.y])
            ) {
                this.setBackToOriginalPosition(true);
                this.displayErrorMessage();
                return;
            } else {
                this.placeTile();
            }
        }
        this.dragObj = null;
        this.currentTile = new PlaceTile();
    }

    private setAllTilesInteractive(): void {
        for (const [tile, id, type] of this.displayedTiles) {
            tile.on(
                "pointerdown",
                () => {
                    this.dragObj = tile;
                    this.dragObj.setDepth(Number.MAX_SAFE_INTEGER);
                    this.currentTile.id = id;
                    this.currentTile.type = type;
                    this.setBackToOriginalPosition(false);
                    this.toggleDrag();
                },
                this,
            );
        }
    }

    private setBackToOriginalPosition(onlyDragObj: Boolean): void {
        for (const [tile, id, _] of this.displayedTiles) {
            if ((tile === this.dragObj) === onlyDragObj) {
                tile.x = this.originalLocations[id][0];
                tile.y = this.originalLocations[id][1];
                tile.angle = 0;
                tile.setDepth(1);
            }
        }
    }

    private setAllTileNotInteractive(): void {
        for (const [tile, id, type] of this.displayedTiles) {
            tile.off(
                "pointerdown",
                () => {
                    this.dragObj = tile;
                    this.dragObj.setDepth(Number.MAX_SAFE_INTEGER);
                    this.currentTile.id = id;
                    this.currentTile.type = type;
                    this.toggleDrag();
                },
                this,
            );
            tile.setAlpha(0.5);
            tile.setTint(0xfefeee);
        }
    }

    private handleViewportChange(viewport: { x: int; y: int }): void {
        this.topLeftX = viewport.x;
        this.topLeftY = viewport.y;
    }

    private checkAdjacency(uiCoordinates: int[]): boolean {
        const gameWorldCoordinates: int[] =
            this.translateCoordinates(uiCoordinates);
        const adjacencyMap: Nullable<AdjacencyMap> =
            TileManager.getAdjacencyMap();
        assert(adjacencyMap);
        return adjacencyMap.isAdjacent(
            gameWorldCoordinates[0],
            gameWorldCoordinates[1],
        );
    }

    private checkConnections(uiCoordinates: int[]): boolean {
        const gameWorldCoordinates: int[] =
            this.translateCoordinates(uiCoordinates);
        const adjacencyMap: Nullable<AdjacencyMap> =
            TileManager.getAdjacencyMap();
        assert(adjacencyMap);
        return adjacencyMap.isAligned(
            gameWorldCoordinates[0],
            gameWorldCoordinates[1],
            this.currentTile,
        );
    }

    private translateCoordinates(uiCoordinates: int[]): int[] {
        return [
            (Phaser.Math.Snap.To(
                uiCoordinates[0],
                GameUiScreen.tilePixels,
                -this.topLeftX,
            ) +
                this.topLeftX) /
                128,
            (Phaser.Math.Snap.To(
                uiCoordinates[1],
                GameUiScreen.tilePixels,
                -this.topLeftY,
            ) +
                this.topLeftY) /
                128,
        ];
    }

    private placeTile(): void {
        if (!this.dragObj) {
            return;
        }
        this.currentTile.coordinateX =
            (this.dragObj.x + this.topLeftX) / GameUiScreen.tilePixels;
        this.currentTile.coordinateY =
            (this.dragObj.y + this.topLeftY) / GameUiScreen.tilePixels;
        TileManager.placeTile(this.currentTile);
        this.dragObj.destroy();
    }

    private displayErrorMessage(): void {
        this.wrongText = this.add.text(100, 100, "Oops! Path doesn't fit", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ff0000",
        });
    }
}
