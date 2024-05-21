import Phaser from "phaser";
import { ScreenHeight, ScreenWidth } from "../core/main";
import { assert, interactify } from "../utilities/utils";
import { float, Nullable } from "../definitions/utils";
import GameRules from "configs/gameRules.json";

export class GameRulesScreen extends Phaser.Scene {
    private scrollContainer: Nullable<Phaser.GameObjects.Container>;
    private scrollMask: Nullable<Phaser.Display.Masks.GeometryMask>;

    public constructor() {
        super("GameRulesScreen");
        this.scrollContainer = null;
        this.scrollMask = null;
    }

    public preload(): void {
        this.load.image("back", "assets/buttons/back.png");
    }

    public create(): void {
        this.addTitle();
        this.addScrollableText();

        const backButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.5,
            ScreenHeight / 1.25,
            "back",
        );
        interactify(backButton, 0.5, () => this.onBackButton());
    }

    private addTitle(): void {
        this.add
            .text(ScreenWidth / 2, ScreenHeight / 8, "Saboteur Rules", {
                fontFamily: "VT323",
                fontSize: 38,
                color: "#ffffff",
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle)
            .setOrigin(0.5);
    }

    private addScrollableText(): void {
        const scrollAreaHeight: number = ScreenHeight / 2;
        const scrollAreaWidth: number = ScreenWidth * 0.8;
        const scrollAreaY: number = ScreenHeight / 4;
        const rules: string = this.getRules();
        this.scrollContainer = this.createScrollContainer(
            scrollAreaWidth,
            scrollAreaY,
        );
        const rulesText: Phaser.GameObjects.Text = this.createRulesText(
            scrollAreaWidth,
            rules,
        );
        this.scrollContainer.add(rulesText);
        if (rulesText.height <= scrollAreaHeight) {
            return;
        }
        this.createScrollMask(scrollAreaWidth, scrollAreaHeight, scrollAreaY);
        this.setupScrolling(rulesText, scrollAreaHeight);
    }

    private createScrollContainer(
        scrollAreaWidth: number,
        scrollAreaY: number,
    ): Phaser.GameObjects.Container {
        const container = this.add.container(ScreenWidth / 2, scrollAreaY);
        container.setSize(scrollAreaWidth, ScreenHeight / 2);
        return container;
    }

    private createRulesText(
        scrollAreaWidth: number,
        rules: string,
    ): Phaser.GameObjects.Text {
        const rulesText: Phaser.GameObjects.Text = this.add.text(0, 0, rules, {
            fontFamily: "VT323",
            fontSize: 20,
            color: "#ffffff",
            wordWrap: { width: scrollAreaWidth - 20 },
        });
        rulesText.setOrigin(0.5, 0);
        return rulesText;
    }

    private createScrollMask(
        scrollAreaWidth: number,
        scrollAreaHeight: number,
        scrollAreaY: number,
    ): void {
        assert(this.scrollContainer);
        const maskShape: Phaser.GameObjects.Graphics = this.make.graphics({
            x: 0,
            y: 0,
        });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            (ScreenWidth - scrollAreaWidth) / 2,
            scrollAreaY,
            scrollAreaWidth,
            scrollAreaHeight,
        );
        this.scrollMask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(this.scrollMask);
    }

    private setupScrolling(
        rulesText: Phaser.GameObjects.Text,
        scrollAreaHeight: number,
    ): void {
        this.input.on(
            "wheel",
            (
                _pointer: Phaser.Input.Pointer,
                _gameObjects: Phaser.GameObjects.DisplayList,
                _deltaX: float,
                deltaY: float,
            ) => {
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

    private getRules(): string {
        return `${GameRules.gameDescription}\n${GameRules.gameSetup}\n${GameRules.turn}\n${GameRules.miners}\n${GameRules.saboteurs}\n${GameRules.veinInspection}\n${GameRules.gameEnd}\n${GameRules.closing}`;
    }
}
