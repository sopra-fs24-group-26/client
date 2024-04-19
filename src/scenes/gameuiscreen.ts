import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { log } from "utilities/logger";
import { assert, interactify } from "utilities/utils";
import { float, int, Nullable } from "../definitions/utils";
import { Tile } from "../entities/Tile";
import TileManager from "../managers/TileManager";

export class GameUiScreen extends Phaser.Scene {
    private back: Nullable<Phaser.GameObjects.Rectangle>;

    public constructor() {
        super("GameUiScreen");
        this.back = null;
    }

    public preload(): void {
        for (let i: int = 0; i < 9; i++) {
            this.load.image(`tile${i}`, `assets/tiles/tile${i}.png`);
        }
    }

    public preload(): void {
        this.load.image("start", "assets/buttons/start.png");
    }

    public create(): void {
        this.back = this.add.rectangle(
            ScreenWidth / 2,
            ScreenHeight - 100,
            ScreenWidth * 0.8,
            200,
            0x808080,
        );
        this.back.setInteractive();
        this.displayDrawnTiles();
    }

    private displayDrawnTiles(): void {
        const myTiles: Nullable<Tile[]> = TileManager.getTilesInHand();
        assert(myTiles);
        const nrTiles: int = myTiles.length;
        for (let i: int = 0; i < nrTiles; i++) {
            const tileSpacing: int =
                (this.back.width - nrTiles * 128) / (nrTiles + 1);
            this.add.image(
                this.back.getTopLeft().x +
                    (tileSpacing + 128 / 2) +
                    i * (128 + tileSpacing),
                ScreenHeight - 100,
                `tile${myTiles[i].type}`,
            );
        }
    }
}
