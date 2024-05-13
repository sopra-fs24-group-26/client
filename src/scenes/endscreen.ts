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
        //PlayerManager.removeId();

        const button: Phaser.GameObjects.Image = this.add
            .image(ScreenWidth / 2, ScreenHeight / 1.5, "quit")
            .setOrigin(0.5, 0.5);
        interactify(button, 0.5, () => this.onButton());
    }

    private async onButton(): Promise<void> {
        this.scene.start("TitleScreen");
    }

    private displayByRole(): void {
        let text: string = "You loose";
        let showerOre: string = "coalNugget";
        const me: Nullable<Player> = PlayerManager.getMe();
        assert(me);
        if (
            (me.role === Role.Miner && SessionManager.getReachedGold()) ||
            (me.role === Role.Saboteur && !SessionManager.getReachedGold())
        ) {
            showerOre = "goldNugget";
            text = "You win baby";
        }
        this.createShower(showerOre);
        this.add
            .text(ScreenWidth / 2, ScreenHeight / 2, text, {
                fontFamily: "Arial",
                fontSize: "100px",
                color: "#ffd700",
                fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5);
    }

    private createShower(showerOre: string): void {
        this.add.particles(0, 100, showerOre, {
            x: { min: 0, max: ScreenWidth },
            y: -400,
            accelerationY: 500,
            maxVelocityY: 700,
            quantity: 1,
            lifespan: 5000,
            gravityY: 200,
        });
    }
}
