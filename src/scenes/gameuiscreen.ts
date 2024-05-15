import { ScreenHeight, ScreenWidth } from "core/main";
import Phaser from "phaser";
import { assert, interactify } from "utilities/utils";
import { Placeable } from "../definitions/adjacency";
import { float, int, Nullable, UUID } from "../definitions/utils";
import { Tile } from "../entities/Tile";
import TileManager from "../managers/TileManager";
import SessionManager from "../managers/SessionManager";
import AdjacencyManager from "../managers/AdjacencyManager";
import { Player } from "../entities/Player";
import PlayerManager from "../managers/PlayerManager";
import { Role } from "../definitions/enums";
import { Session } from "../entities/Session";

export class GameUiScreen extends Phaser.Scene {
    private static tilePixels: int = 128;
    private static trashcanPixels: int = 30;
    private static profilePixels: int = 50;
    private uiBackground: Nullable<Phaser.GameObjects.Rectangle>;
    private drawnTilesContainer: Nullable<Phaser.GameObjects.Container>;
    private profilesContainer: Nullable<Phaser.GameObjects.Container>;
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
        this.profilesContainer = null;
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
            this.displayProfiles();
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
        const allPlayers: Nullable<Player[]> = PlayerManager.getAll();
        assert(allPlayers);
        for (let i: int = 0; i < allPlayers.length; i++) {
            let player: Player = allPlayers[i];
            this.load.image(
                `avatar${player.orderIndex}`,
                `https://api.dicebear.com/8.x/pixel-art/svg?seed=${player.name}&size=${GameUiScreen.profilePixels}&beardProbability=0&glassesProbability=0&hat=variant01&hatColor=ad6d3e&skinColor=a26d3d,b68655`,
            );
        }
        this.load.image("ring", "assets/profiles/ring.png");
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
        this.profilesContainer = this.add.container();
        assert(this.input.keyboard);
        this.input.keyboard.on("keydown-LEFT", () => this.turnTileLeft());
        this.input.keyboard.on("keydown-A", () => this.turnTileLeft());
        this.input.keyboard.on("keydown-RIGHT", () => this.turnTileRight());
        this.input.keyboard.on("keydown-D", () => this.turnTileRight());
        const gamescreen: Phaser.Scene = this.scene.get("GameScreen");
        gamescreen.events.on(
            "cameraViewportChanged",
            this.handleViewportChange,
            this,
        );
        this.events.on(
            "cameraViewportChanged",
            this.handleViewportChange,
            this,
        );
    }

    private displayProfiles(): void {
        const all: Nullable<Player[]> = PlayerManager.getAll();
        const me: Nullable<Player> = PlayerManager.getMe();
        const session: Nullable<Session> = SessionManager.get();
        assert(me && all && session && this.profilesContainer);
        this.profilesContainer.removeAll(true);
        const count: int = all.length;
        const spacing: int =
            (ScreenWidth - count * GameUiScreen.profilePixels) / (count + 1);
        const y: float = ScreenHeight / 10;
        for (let i: int = 0; i < count; i++) {
            this.displayPlayer(all, spacing, i, count, y, me);
        }
    }

    private displayPlayer(
        all: Player[],
        spacing: int,
        i: int,
        count: int,
        y: float,
        me: Player,
    ): void {
        assert(this.profilesContainer);
        let name: string = all[i].name;
        const x: float =
            spacing +
            GameUiScreen.profilePixels / 2 +
            i * (GameUiScreen.profilePixels + spacing);

        const profile = this.add.image(x, y, `avatar${all[i].orderIndex}`);
        this.profilesContainer.add(profile);
        if (SessionManager.isPlayersTurn(all[i], count)) {
            this.profilesContainer.add(this.add.image(x, y, "ring"));
        }
        if (all[i].orderIndex === me.orderIndex) {
            this.addRole(x, y, me);
            name += " (Me)";
        }
        this.addName(x, y, name);
    }

    private addRole(x: float, y: float, me: Player): void {
        assert(this.profilesContainer);
        let roleString: string = "Miner";
        if (me.role === Role.Saboteur) {
            roleString = "Saboteur";
        }
        const roleText = this.add.text(
            x,
            y - GameUiScreen.profilePixels,
            roleString,
            {
                fontFamily: "Verdana",
                fontSize: "11px",
                color: "#ffd700",
                fontStyle: "bold",
            } as Phaser.Types.GameObjects.Text.TextStyle,
        );
        roleText.setOrigin(0.5, 0.5);
        this.profilesContainer.add(roleText);
    }

    private addName(x: float, y: float, name: string): void {
        assert(this.profilesContainer);
        const nameText = this.add.text(
            x,
            y + GameUiScreen.profilePixels / 1.2,
            name,
            {
                fontFamily: "Verdana",
                fontSize: "11px",
                color: "#ffffff",
                fontStyle: "bold",
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle,
        );
        nameText.setOrigin(0.5, 0);
        nameText.setWordWrapWidth(GameUiScreen.profilePixels * 3);
        this.profilesContainer.add(nameText);
    }

    private displayDrawnTiles(): void {
        if (!this.drawnTilesContainer) {
            return;
        }
        assert(this.uiBackground);
        this.drawnTilesContainer.removeAll(true);
        const myTiles: Nullable<Tile[]> = TileManager.getInHand();
        assert(myTiles);
        const nrTiles: int = myTiles.length;
        const tileSpacing: int =
            (this.uiBackground.width - nrTiles * GameUiScreen.tilePixels) /
            (nrTiles + 1);
        for (let i: int = 0; i < nrTiles; i++) {
            const tile: Phaser.GameObjects.Image = this.createTile(
                tileSpacing,
                i,
                myTiles[i].id,
                myTiles[i].type,
            );
            this.createTrashcan(
                tileSpacing,
                i,
                tile,
                myTiles[i].id,
                myTiles[i].type,
            );
        }
    }

    private createTile(
        spacing: int,
        i: int,
        id: UUID,
        type: int,
    ): Phaser.GameObjects.Image {
        assert(this.uiBackground && this.drawnTilesContainer);
        const tile: Phaser.GameObjects.Image = this.add.image(
            this.uiBackground.getTopLeft().x +
                (spacing + GameUiScreen.tilePixels / 2) +
                i * (GameUiScreen.tilePixels + spacing),
            ScreenHeight - 100,
            `tile${type}`,
        );
        tile.setInteractive();
        tile.on(
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
        this.originalLocations.set(
            tile,
            new Phaser.Math.Vector2(tile.x, tile.y),
        );
        this.drawnTilesContainer.add(tile);
        return tile;
    }

    private createTrashcan(
        spacing: int,
        i: int,
        tile: Phaser.GameObjects.Image,
        id: UUID,
        type: int,
    ): void {
        assert(this.uiBackground && this.drawnTilesContainer);
        const trashCan: Phaser.GameObjects.Image = this.add.image(
            this.uiBackground.getTopLeft().x +
                (spacing + GameUiScreen.tilePixels / 2) +
                i * (GameUiScreen.tilePixels + spacing) +
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
            this.currentTile.id = id;
            this.currentTile.type = type;
            this.discardTile();
        });
        this.drawnTilesContainer.add(trashCan);
    }

    private toggleDrag(): void {
        if (!this.isDraging && this.dragObj) {
            this.wrongText?.destroy();
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
        const actionable: Tile | false = this.overActionable(
            this.translateX(activePointer.x),
            this.translateY(activePointer.y),
        );
        assert(this.dragObj);
        if (actionable) {
            this.dragObj.x = this.snapX(activePointer.x);
            this.dragObj.y = this.snapY(activePointer.y);
        } else {
            this.dragObj.x = activePointer.x;
            this.dragObj.y = activePointer.y;
        }
    }

    private overActionable(x: int, y: int): Tile | false {
        return (
            TileManager.getHiddenVeins().filter(
                (tile: Tile) =>
                    tile.coordinateX === x && tile.coordinateY === y,
            )[0] || false
        );
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
        const activePointer: Phaser.Input.Pointer =
            this.game.input.activePointer;
        const actionable: Tile | false = this.overActionable(
            this.translateX(activePointer.x),
            this.translateY(activePointer.y),
        );
        if (!actionable) {
            this.setBackToOriginalPosition();
            return;
        }
        this.displayOre(actionable);
        this.discardTile();
        this.setBackToOriginalPosition();
    }

    private displayOre(actionable: Tile): void {
        const gamescreen: Phaser.Scene = this.game.scene.getScene("GameScreen");
        assert(actionable.coordinateX !== null);
        assert(actionable.coordinateY !== null);
        const duration: int = 5;
        const hint: Phaser.GameObjects.Image = gamescreen.add.image(
            actionable.coordinateX * GameUiScreen.tilePixels,
            actionable.coordinateY * GameUiScreen.tilePixels,
            `tile${actionable.type === 9 ? 13 : 12}`,
        );
        this.time.delayedCall(duration * 1_000, () => hint.destroy());
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
        const duration: int = 3;
        this.wrongText = this.add.text(
            ScreenWidth / 2,
            ScreenHeight / 4,
            "Oops! Path doesn't fit",
            {
                fontFamily: "Verdana",
                fontSize: "36px",
                fontStyle: "bold",
                color: "#ff5b5b",
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle,
        );
        this.wrongText.setOrigin(0.5, 0.5);
        this.time.delayedCall(duration * 1_000, () =>
            this.wrongText?.destroy(),
        );
    }

    private turnTileLeft(): void {
        if (!this.dragObj) {
            return;
        }
        this.dragObj.angle += -90;
        this.currentTile.rotation = (this.currentTile.rotation - 1) % 4;
    }

    private turnTileRight(): void {
        if (!this.dragObj) {
            return;
        }
        this.dragObj.angle += 90;
        this.currentTile.rotation = (this.currentTile.rotation + 1) % 4;
    }

    private toggleTrashcansVisibility(isVisable: boolean): void {
        assert(this.drawnTilesContainer);
        this.drawnTilesContainer.iterate((image: Phaser.GameObjects.Image) => {
            if (image.texture.key === "trashCan") {
                image.setVisible(isVisable);
            }
        });
    }

    private cleanUp(): void {
        this.toggleTrashcansVisibility(true);
        this.dragObj = null;
        this.currentTile.rotation = 0;
    }
}
