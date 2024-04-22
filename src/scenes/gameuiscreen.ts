import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { assert } from "utilities/utils";
import { int, Nullable, UUID } from "../definitions/utils";
import { Tile } from "../entities/Tile";
import TileManager from "../managers/TileManager";
import sessionManager from "../managers/SessionManager";
import { Session } from "../entities/Session";
import PlayerManager from "../managers/PlayerManager";
import { Player } from "../entities/Player";

export class GameUiScreen extends Phaser.Scene {
    private uiBackground: Nullable<Phaser.GameObjects.Rectangle>;
    private drawnTilesContainer: Nullable<Phaser.GameObjects.Container>;

    public constructor() {
        super("GameUiScreen");
        this.uiBackground = null;
        this.drawnTilesContainer = null;
    }

    public init(): void {
        const tileUpdateListener: UUID = TileManager.onSync.on(() => {
            this.displayDrawnTiles();
        });
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
        this.uiBackground = this.add.rectangle(
            ScreenWidth / 2,
            ScreenHeight - 100,
            ScreenWidth * 0.8,
            200,
            0x808080,
        );
        this.uiBackground.setInteractive();
        this.drawnTilesContainer = this.add.container();
    }

    public displayDrawnTiles(): void {
        assert(this.drawnTilesContainer);
        this.drawnTilesContainer.removeAll(true);
        const myTiles: Nullable<Tile[]> = TileManager.getInHand();
        const session: Nullable<Session> = sessionManager.get();
        const me: Nullable<Player> = PlayerManager.getMe();
        const players: Nullable<Player[]> = PlayerManager.getAll();
        assert(myTiles && this.uiBackground && session && players && me);
        const playerCount: int = players.length;

        const nrTiles: int = myTiles.length;
        const tileSpacing: int =
            (this.uiBackground.width - nrTiles * 128) / (nrTiles + 1);

        for (let i: int = 0; i < nrTiles; i++) {
            const image: Phaser.GameObjects.Image = this.add.image(
                this.uiBackground.getTopLeft().x +
                    (tileSpacing + 128 / 2) +
                    i * (128 + tileSpacing),
                ScreenHeight - 100,
                `tile${myTiles[i].type}`,
            );
            if (session.turnIndex % playerCount === me.orderIndex) {
                if (session.turnIndex === 0 && me.orderIndex === 0) {
                    this.drawnTilesContainer.add(image);
                } else {
                    this.drawnTilesContainer.add(
                        image.setAlpha(0.5).setTint(0xfefeee),
                    );
                }
            } else {
                this.drawnTilesContainer.add(
                    image.setAlpha(0.4).setTint(0xfefeee),
                );
            }
        }
    }
}
