import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { assert } from "utilities/utils";
import { int, Nullable, UUID } from "../definitions/utils";
import { Tile } from "../entities/Tile";
import TileManager from "../managers/TileManager";
import SessionManager from "../managers/SessionManager";

export class GameUiScreen extends Phaser.Scene {
    private uiBackground: Nullable<Phaser.GameObjects.Rectangle>;
    private drawnTilesContainer: Nullable<Phaser.GameObjects.Container>;
    private dragObj: Nullable<Phaser.GameObjects.Image>;
    private originalLocations: { [key: string]: [int, int] };
    private currentTile: PlaceTile;
    private topLeftX: int;
    private topLeftY: int;
    private isDraging: boolean;
    private static tilePixels: int = 128;

    public constructor() {
        super("GameUiScreen");
        this.uiBackground = null;
        this.drawnTilesContainer = null;
        this.dragObj = null;
        this.originalLocations = {};
        this.currentTile = new PlaceTile();
        this.topLeftX = 0;
        this.topLeftY = 0;
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
        this.uiBackground = this.add.rectangle(
            ScreenWidth / 2,
            ScreenHeight - 100,
            ScreenWidth * 0.8,
            200,
            0x808080,
        );
        this.uiBackground.setInteractive();
        this.drawnTilesContainer = this.add.container();
        this.scene.get("GameScreen").events.on("cameraViewportChanged", this.handleViewportChange, this);
        this.input.keyboard.on('keydown-LEFT', () => {
            if (this.dragObj) {
                this.dragObj.angle += -90;
                this.currentTile.rotation = (this.currentTile.rotation - 1) % 4;
            }
        });
        this.input.keyboard.on('keydown-RIGHT', () => {
            if (this.dragObj) {
                this.dragObj.angle += 90;
                this.currentTile.rotation = (this.currentTile.rotation + 1) % 4;
            }
        });
        this.events.on("cameraViewportChanged", this.handleViewportChange, this);
        this.displayDrawnTiles();
    }

    public displayDrawnTiles(): void {
        assert(this.drawnTilesContainer);
        this.drawnTilesContainer.removeAll(true);
        const myTiles: Nullable<Tile[]> = TileManager.getTilesInHand();
        //commentet out for testing purposees
        //const myTiles: Nullable<Tile[]> = TileManager.getInHand();
        assert(myTiles && this.uiBackground);

        const nrTiles: int = myTiles.length;
        const tileSpacing: int =
            (this.uiBackground.width - nrTiles * GameUiScreen.tilePixels) / (nrTiles + 1);
            (this.uiBackground.width - nrTiles * 128) / (nrTiles + 1);
        const myTurn: boolean = SessionManager.isMyTurn();

        for (let i: int = 0; i < nrTiles; i++) {            const tile: Phaser.GameObjects.Image = this.add.image(
            this.uiBackground.getTopLeft().x +
            (tileSpacing + GameUiScreen.tilePixels / 2) +
            i * (GameUiScreen.tilePixels + tileSpacing), ScreenHeight - 100, `tile${myTiles[i].type}`,
        );
            tile.setInteractive();
            this.originalLocations[myTiles[i].id.toString()] = [tile.x, tile.y];
            tile.on('pointerdown', (() => {
                this.dragObj = tile;
                this.dragObj.setDepth(Number.MAX_SAFE_INTEGER);
                this.currentTile.id = myTiles[i].id.toString();
                this.toggleDrag();
            }), this);
            if (!myTurn) {
                tile.setAlpha(0.5);
                tile.setTint(0xfefeee);
                tile.disableInteractive();
                tile.off('pointerdown', (() => {
                    this.dragObj = tile;
                    this.dragObj.setDepth(Number.MAX_SAFE_INTEGER);
                    this.currentTile.id = myTiles[i].id.toString();
                    this.toggleDrag();
                }), this);
            }
            this.drawnTilesContainer.add(tile);
        }
    }

    private toggleDrag(): void {
        if(!this.isDraging && this.dragObj){
            this.dragObj.on('pointermove', this.doDrag, this);
            this.dragObj.on('pointerdown', this.stopDrag, this);
            this.dragObj.on('pointerout', this.doDrag, this);
            this.isDraging = true;
        }else if (this.dragObj) {
            this.dragObj.off('pointermove', this.doDrag, this);
            this.dragObj.off('pointerdown', this.stopDrag, this);
            this.dragObj.off('pointerout', this.doDrag, this);
            this.isDraging = false;
        }
    }

    private doDrag(): void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer
        if (this.dragObj) {
            if (activePointer.y < this.uiBackground.getTopLeft().y) {
                this.dragObj.x = Phaser.Math.Snap.To(activePointer.x, GameUiScreen.tilePixels,  - this.topLeftX);
                this.dragObj.y = Phaser.Math.Snap.To(activePointer.y, GameUiScreen.tilePixels,  - this.topLeftY);
            } else {
                this.dragObj.x = activePointer.x;
                this.dragObj.y = activePointer.y;
            }
        }
    }

    private stopDrag():void {
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer
        if(this.dragObj && this.currentTile){
            if (activePointer.y > this.uiBackground.getTopLeft().y) {
                assert(this.currentTile.id);
                this.dragObj.x = this.originalLocations[this.currentTile.id][0];
                this.dragObj.y = this.originalLocations[this.currentTile.id][1];
                this.dragObj.angle = 0;
                this.dragObj.setDepth(10);
            }else {
                this.currentTile.coordinateX = (this.dragObj.x + this.topLeftX)/GameUiScreen.tilePixels;
                this.currentTile.coordinateY = (this.dragObj.y + this.topLeftY)/GameUiScreen.tilePixels;
                TileManager.placeTile(this.currentTile);
                this.dragObj.destroy();
            }
        }
        this.dragObj = null;
        this.currentTile = new PlaceTile();
    }
    private handleViewportChange(viewport: {x: int, y: int}): void {
        this.topLeftX = viewport.x;
        this.topLeftY = viewport.y;
    }
}