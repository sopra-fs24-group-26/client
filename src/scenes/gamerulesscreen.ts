import Phaser from "phaser";
import { Font, ScreenHeight, ScreenWidth } from "../core/main";
import { assert, interactify } from "../utilities/utils";
import { float, int, Nullable } from "../definitions/utils";
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
        this.addScrollNote();
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
            .bitmapText(ScreenWidth / 2, ScreenHeight / 8, Font)
            .setTint(0xc06b0b)
            .setText("Saboteur Rules")
            .setFontSize(50)
            .setCenterAlign()
            .setOrigin(0.5);
    }

    private addScrollNote(): void {
        this.add
            .bitmapText(ScreenWidth / 2, ScreenHeight / 8 + 35, Font)
            .setTint(0xffffff)
            .setText("Scroll to View")
            .setFontSize(25)
            .setCenterAlign()
            .setOrigin(0.5);
    }

    private addScrollableText(): void {
        const scrollAreaHeight: int = ScreenHeight / 2;
        const scrollAreaWidth: int = ScreenWidth * 0.8;
        const scrollAreaY: int = ScreenHeight / 8 + 70;
        const rules: string = this.getRules();
        this.scrollContainer = this.createScrollContainer(
            scrollAreaWidth,
            scrollAreaY,
        );
        const rulesText: Phaser.GameObjects.BitmapText = this.createRulesText(
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
        scrollAreaWidth: int,
        scrollAreaY: int,
    ): Phaser.GameObjects.Container {
        const container: Phaser.GameObjects.Container = this.add.container(
            ScreenWidth / 2,
            scrollAreaY,
        );
        container.setSize(scrollAreaWidth, ScreenHeight / 2);
        return container;
    }

    private createRulesText(
        scrollAreaWidth: int,
        rules: string,
    ): Phaser.GameObjects.BitmapText {
        return this.add
            .bitmapText(0, 0, Font)
            .setTint(0xffffff)
            .setText(rules)
            .setFontSize(25)
            .setOrigin(0.5, 0)
            .setMaxWidth(scrollAreaWidth - 20);
    }

    private createScrollMask(
        scrollAreaWidth: int,
        scrollAreaHeight: int,
        scrollAreaY: int,
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
        rulesText: Phaser.GameObjects.BitmapText,
        scrollAreaHeight: int,
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
                        ScreenHeight / 4 - rulesText.height + scrollAreaHeight - 100,
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
