import Phaser from "phaser";
import { ScreenHeight, ScreenWidth } from "../core/main";
import { interactify } from "../utilities/utils";
import { int, Nullable } from "../definitions/utils";

export class GameRulesScreen extends Phaser.Scene {
    title: Nullable<Phaser.GameObjects.Text>;
    scrollContainer: Nullable<Phaser.GameObjects.Container>;
    scrollMask: Nullable<Phaser.Display.Masks.GeometryMask>;

    public constructor() {
        super("GameRulesScreen");
        this.title = null;
        this.scrollContainer = null;
        this.scrollMask = null;
    }

    public preload(): void {
        this.load.image("quit", "assets/buttons/quit.png");
    }

    public create(): void {
        this.addTitle();
        this.addScrollableText();

        const backButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.5,
            ScreenHeight / 1.25,
            "quit",
        );
        interactify(backButton, 0.5, () => this.onBackButton());
    }
    private addTitle(): void {
        this.title = this.add
            .text(ScreenWidth / 2, ScreenHeight / 8, "Saboteur Rules", {
                fontFamily: "Verdana",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle)
            .setOrigin(0.5);
    }

    private addScrollableText(): void {
        const scrollAreaHeight: int = ScreenHeight / 2;
        const scrollAreaWidth: int = ScreenWidth * 0.8;
        const scrollAreaY: int = ScreenHeight / 4;

        this.scrollContainer = this.add.container(ScreenWidth / 2, scrollAreaY);
        this.scrollContainer.setSize(scrollAreaWidth, scrollAreaHeight);

        const rulesText = this.add.text(
            0,
            0,
            "The players take on the part of dwarves. Either they are gold-diggers, " +
                "working their tunnels ever deeper into the mountain in search of treasures, " +
                "or they are saboteurs trying to put obstacles into the diggers’ path. " +
                "The members of each group should support each other, even though often " +
                "they can only guess who is what. If the gold-diggers manage to create a " +
                "path to the treasure, they are duly rewarded with gold, while " +
                "the saboteurs have to leave with coal in their pockets. However, should the gold-diggers " +
                "fail, the saboteurs reap the reward. Only when the gold is found are the " +
                "roles revealed.\n" +
                "In the begining only four tiles are in the gameworld. The left most tile is the startig tile, " +
                "from which the dwarfs can start the path. The three goal tiles, or veins, are seven tiles to " +
                "the right from the start tile." +
                "Two veins are coal and one is gold.\n" +
                "The dwarfs take turns placing either a path, an eye or discarding a tile (only one of these actions can be performed). " +
                "The turn will end with recieving another tile, if there are any left.\n" +
                "The goal of the miners is to find the gold via placing an uninterupted" +
                "path from the start to the gold vein. Tiles can only be placed, if they have an uninterupted path leading to the start" +
                " and the paths align with all the adjacent tiles. For example a path that leads into a wall is illegal. " +
                "Keep in mind blocking paths with a blocking tile is legal.\n" +
                "In the beggining, it is unknown which vein has gold beneath and which has coal. With the" +
                "eye a dwarf can inspect one vein for a brief amount of time. " +
                "If a vein is connected to the start, said vein will be permanatly revealed. If it is gold, " +
                "the miners win, and if it is coal the game continues. If all the 44 tiles are used up, without reaching the gold the saboteurs win. \n" +
                "Good luck digging and saboteuring!",
            {
                fontFamily: "Verdana",
                fontSize: 20,
                color: "#ffffff",
                wordWrap: { width: scrollAreaWidth - 20 },
            },
        );
        rulesText.setOrigin(0.5, 0);
        this.scrollContainer.add(rulesText);

        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            (ScreenWidth - scrollAreaWidth) / 2,
            scrollAreaY,
            scrollAreaWidth,
            scrollAreaHeight,
        );

        this.scrollMask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(this.scrollMask);

        this.input.on(
            "wheel",
            (pointer, gameObjects, deltaX, deltaY, deltaZ): void => {
                if (this.scrollContainer) {
                    this.scrollContainer.y -= deltaY;
                    this.scrollContainer.y = Phaser.Math.Clamp(
                        this.scrollContainer.y,
                        ScreenHeight / 4 - rulesText.height + scrollAreaHeight,
                        ScreenHeight / 4,
                    );
                }
            },
        );
    }

    private onBackButton(): void {
        this.scene.start("LobbyScreen");
    }
}
