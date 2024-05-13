import { Nullable } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { assert, interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";
import PlayerManager from "managers/PlayerManager";
import { Player } from "entities/Player";
import { Role } from "definitions/enums";

export class EndScreen extends Phaser.Scene {
    public constructor() {
        super("EndScreen");
    }

    public preload(): void {
        this.load.image("quit", "assets/buttons/quit.png");
        this.load.image("goldNugget", "assets/particles/goldNugget.png");
        this.load.image("coalNugget", "assets/particles/coalNugget.png");
    }

    public create(): void {
        this.displayByRole();
        PlayerManager.removeId();

        const button: Phaser.GameObjects.Image = this.add
            .image(ScreenWidth / 2, ScreenHeight / 1.5, "quit")
            .setOrigin(0.5, 0.5);
        interactify(button, 0.5, () => this.onButton());
    }

    private async onButton(): Promise<void> {
        this.scene.start("TitleScreen");
    }

    private displayByRole(): void {
        const { showerOreType, text } = this.getDisplayData();
        this.createShower(showerOreType);
        this.displayText(text);
    }

    private getDisplayData(): { showerOreType: string; text: string } {
        let text: string = "You lose!";
        let showerOreType: string = "coalNugget";
        const me: Nullable<Player> = PlayerManager.getMe();
        assert(me);
        const minerWin: boolean =
            me.role === Role.Miner && SessionManager.getReachedGold();
        const saboteurWin: boolean =
            me.role === Role.Saboteur && !SessionManager.getReachedGold();
        if (minerWin || saboteurWin) {
            showerOreType = "goldNugget";
            text = "You win!";
        }
        return { showerOreType, text };
    }

    private createShower(showerOre: string): void {
        this.add.particles(0, 100, showerOre, {
            x: {
                min: 0,
                max: ScreenWidth,
            },
            y: -250,
            accelerationY: 300,
            maxVelocityY: 300,
            quantity: 1,
            lifespan: 6000,
            gravityY: 200,
            scale: { min: 0.2, max: 0.8 },
            rotate: { start: 0, end: 360 },
        } as Phaser.Types.GameObjects.Particles.ParticleEmitterConfig);
    }

    private displayText(text: string): void {
        this.add
            .text(ScreenWidth / 2, ScreenHeight / 2, text, {
                fontFamily: "Arial",
                fontSize: "100px",
                color: "#fbfcfc",
                fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5);
    }
}
