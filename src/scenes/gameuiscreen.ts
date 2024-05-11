import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { assert, interactify } from "utilities/utils";
import { Placeable } from "../definitions/adjacency";
import { int, Nullable, UUID } from "../definitions/utils";
import { Tile } from "../entities/Tile";
import TileManager from "../managers/TileManager";
import SessionManager from "../managers/SessionManager";
import AdjacencyManager from "../managers/AdjacencyManager";
import { log } from "utilities/logger";

export class GameUiScreen extends Phaser.Scene {
    private static tilePixels: int = 128;
    private static trashcanPixels: int = 30;
    private uiBackground: Nullable<Phaser.GameObjects.Rectangle>;
    private drawnTilesContainer: Nullable<Phaser.GameObjects.Container>;
    private topLeftX: int;
    private topLeftY: int;
    private dragObj: Nullable<Phaser.GameObjects.Image>;
    private currentTile: Placeable;
    private originalLocations: Map<
        Phaser.GameObjects.Image,
        Phaser.Math.Vector2
    >;
    private wrongText: Nullable<Phaser.GameObjects.Text>;
    private isDraging: boolean;

    public constructor() {
        super("GameUiScreen");
        this.uiBackground = null;
        this.drawnTilesContainer = null;
        this.topLeftX = 0;
        this.topLeftY = 0;
        this.dragObj = null;
        this.currentTile = {
            id: null,
            type: null,
            sessionId: null,
            rotation: 0,
            coordinateX: null,
            coordinateY: null,
        } as Placeable;
        this.originalLocations = new Map<
            Phaser.GameObjects.Image,
            Phaser.Math.Vector2
        >();
        this.wrongText = null;
        this.isDraging = false;
    }

    public init(): void {
        const tileUpdateListener: UUID = TileManager.onSync.on(() => {
            if (this.isDraging) {
                return;
            }
            let isMyTurn: boolean = SessionManager.isMyTurn();
            this.displayDrawnTiles();
            if (!isMyTurn) {
                this.setAllTileNotInteractive();
            }
        });
        this.events.on("destroy", () => {
            TileManager.onSync.off(tileUpdateListener);
        });
    }

    public preload(): void {
        for (let i: int = 0; i < 9; i++) {
            this.load.image(`tile${i}`, `assets/tiles/tile${i}.png`);
        }
        this.load.image("trashCan", "assets/buttons/trashcan.png");
    }

    public create(): void {
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
        this.input.keyboard.on("keydown-LEFT", () => this.turnTileLeft());
        this.input.keyboard.on("keydown-A", () => this.turnTileLeft());
        this.input.keyboard.on("keydown-RIGHT", () => this.turnTileRight());
        this.input.keyboard.on("keydown-D", () => this.turnTileRight());

        this.events.on(
            "cameraViewportChanged",
            this.handleViewportChange,
            this,
        );
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

        for (let i: int = 0; i < nrTiles; i++) {
            const tile: Phaser.GameObjects.Image = this.add.image(
                this.uiBackground.getTopLeft().x +
                    (tileSpacing + GameUiScreen.tilePixels / 2) +
                    i * (GameUiScreen.tilePixels + tileSpacing),
                ScreenHeight - 100,
                `tile${myTiles[i].type}`,
            );
            tile.setInteractive();
            tile.on(
                "pointerdown",
                () => {
                    this.dragObj = tile;
                    this.dragObj.setDepth(Number.MAX_SAFE_INTEGER);
                    this.currentTile.id = myTiles[i].id;
                    this.currentTile.type = myTiles[i].type;
                    this.toggleDrag();
                },
                this,
            );
            this.originalLocations.set(
                tile,
                new Phaser.Math.Vector2(tile.x, tile.y),
            );
            this.drawnTilesContainer.add(tile);

            const trashCan: Phaser.GameObjects.Image = this.add.image(
                this.uiBackground.getTopLeft().x +
                    (tileSpacing + GameUiScreen.tilePixels / 2) +
                    i * (GameUiScreen.tilePixels + tileSpacing) +
                    (GameUiScreen.tilePixels - GameUiScreen.trashcanPixels) / 2,
                ScreenHeight -
                    100 +
                    (GameUiScreen.tilePixels - GameUiScreen.trashcanPixels) / 2,
                "trashCan",
            );
            interactify(trashCan, 1, () => {
                if (this.dragObj !== null) {
                    return;
                }
                trashCan.destroy();
                this.dragObj = tile;
                this.currentTile.id = myTiles[i].id;
                this.currentTile.type = myTiles[i].type;
                this.discardTile();
            });
            this.drawnTilesContainer.add(trashCan);
        }
    }

    private toggleDrag(): void {
        if (!this.isDraging && this.dragObj) {
            if (this.wrongText) this.wrongText.destroy();
            this.toggleTrashcansVisibility(false);
            this.input.on("pointermove", this.doDrag, this);
            this.dragObj.on("pointerdown", this.stopDrag, this);
            this.isDraging = true;
        } else if (this.dragObj) {
            this.input.off("pointermove", this.doDrag, this);
            this.dragObj.off("pointerdown", this.stopDrag, this);
            this.isDraging = false;
        }
    }

    private doDrag(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        assert(this.uiBackground);
        if (!this.dragObj) {
            return;
        }
        if (activePointer.y < this.uiBackground.getTopLeft().y) {
            if (this.dragObj.texture.key.includes("14")) {
                this.doDragAction();
                return;
            }
            this.doDragTile();
        } else {
            this.dragObj.x = activePointer.x;
            this.dragObj.y = activePointer.y;
        }
    }

    private doDragAction(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        assert(this.dragObj);
        this.dragObj.x = this.snapX(activePointer.x);
        this.dragObj.y = this.snapY(activePointer.y);
    }

    private doDragTile(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        const adjacency: boolean = AdjacencyManager.checkAdjacency(
            this.translateX(activePointer.x),
            this.translateY(activePointer.y),
        );
        assert(this.dragObj);
        if (adjacency) {
            this.dragObj.x = this.snapX(activePointer.x);
            this.dragObj.y = this.snapY(activePointer.y);
        } else {
            this.dragObj.x = activePointer.x;
            this.dragObj.y = activePointer.y;
        }
    }

    private stopDrag(): void {
        if (!this.dragObj || !this.currentTile) {
            this.cleanUp();
            return;
        }
        if (this.dragObj.texture.key.includes("14")) {
            this.stopDragAction();
            return;
        }
        this.stopDragTile();
    }

    private stopDragAction(): void {
        const overVein: boolean = true;
        if (overVein) {
            log("show ore");
            this.discardTile();
            //timer with display ore
            return;
        }
        this.setBackToOriginalPosition();
    }

    private stopDragTile(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        assert(this.uiBackground);
        const adjacency: boolean = AdjacencyManager.checkAdjacency(
            this.translateX(activePointer.x),
            this.translateY(activePointer.y),
        );
        if (!adjacency || activePointer.y > this.uiBackground.getTopLeft().y) {
            this.setBackToOriginalPosition();
            return;
        }
        const conncetions: boolean = AdjacencyManager.checkConnections(
            this.translateX(activePointer.x),
            this.translateY(activePointer.y),
            this.currentTile,
        );
        if (!conncetions) {
            this.setBackToOriginalPosition();
            this.displayErrorMessage();
            return;
        }
        this.placeTile();
    }

    private setBackToOriginalPosition(): void {
        assert(this.drawnTilesContainer);
        if (!this.dragObj) {
            return;
        }
        const original: Nullable<Phaser.Math.Vector2> =
            this.originalLocations.get(this.dragObj) ?? null;
        assert(original);
        this.dragObj.x = original.x;
        this.dragObj.y = original.y;
        this.dragObj.angle = 0;
        this.dragObj.setDepth(1);
        this.currentTile.rotation = 0;
        this.cleanUp();
    }

    private setAllTileNotInteractive(): void {
        assert(this.drawnTilesContainer);
        for (const tile of this.drawnTilesContainer.list) {
            if (!(tile instanceof Phaser.GameObjects.Image)) {
                continue;
            }
            tile.disableInteractive();
            tile.setAlpha(0.5);
            tile.setTint(0xfefeee);
        }
    }

    private handleViewportChange(viewport: { x: int; y: int }): void {
        this.topLeftX = viewport.x;
        this.topLeftY = viewport.y;
    }

    private translateX(x: int): int {
        return (this.snapX(x) + this.topLeftX) / 128;
    }

    private translateY(y: int): int {
        return (this.snapY(y) + this.topLeftY) / 128;
    }

    private snapX(x: int): int {
        return Phaser.Math.Snap.To(x, GameUiScreen.tilePixels, -this.topLeftX);
    }

    private snapY(y: int): int {
        return Phaser.Math.Snap.To(y, GameUiScreen.tilePixels, -this.topLeftY);
    }

    private placeTile(): void {
        if (!this.dragObj) {
            return;
        }
        this.currentTile.coordinateX =
            (this.dragObj.x + this.topLeftX) / GameUiScreen.tilePixels;
        this.currentTile.coordinateY =
            (this.dragObj.y + this.topLeftY) / GameUiScreen.tilePixels;
        TileManager.place(this.currentTile);
        this.dragObj.destroy();
        this.setAllTileNotInteractive();
        this.cleanUp();
    }

    private discardTile(): void {
        assert(this.dragObj);
        TileManager.discard(this.currentTile);
        this.dragObj.destroy();
        this.cleanUp();
        this.setAllTileNotInteractive();
    }

    private displayErrorMessage(): void {
        this.wrongText = this.add.text(100, 100, "Oops! Path doesn't fit", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ff0000",
        });
    }

    private turnTileLeft(): void {
        if (this.dragObj) {
            this.dragObj.angle += -90;
            this.currentTile.rotation = (this.currentTile.rotation - 1) % 4;
        }
    }

    private turnTileRight(): void {
        if (this.dragObj) {
            this.dragObj.angle += 90;
            this.currentTile.rotation = (this.currentTile.rotation + 1) % 4;
        }
    }

    private toggleTrashcansVisibility(isVisable: boolean): void {
        assert(this.drawnTilesContainer);
        this.drawnTilesContainer.iterate(
            (image: {
                texture: { key: string };
                setVisible: (arg0: boolean) => void;
            }): void => {
                if (image.texture.key === "trashCan") {
                    image.setVisible(isVisable);
                }
            },
        );
    }

    private cleanUp(): void {
        this.toggleTrashcansVisibility(true);
        this.dragObj = null;
        this.currentTile.rotation = 0;
    }
}
