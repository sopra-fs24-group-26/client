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
    }

    public create(): void {
        this.displayMessage();
        PlayerManager.removeId();

        const button: Phaser.GameObjects.Image = this.add
            .image(ScreenWidth / 2, ScreenHeight / 1.5, "quit")
            .setOrigin(0.5, 0.5);
        interactify(button, 0.5, () => this.onButton());
    }

    private async onButton(): Promise<void> {
        this.scene.start("TitleScreen");
    }

    private displayMessage(): void {
        let text: string = "You loose";
        const me: Nullable<Player> = PlayerManager.getMe();
        assert(me);
        const minerWin: boolean =
            me.role === Role.Miner && SessionManager.getReachedGold();
        const saboteurWin: boolean =
            me.role === Role.Saboteur && !SessionManager.getReachedGold();
        if (minerWin || saboteurWin) {
            text = "You win baby";
        }
        this.add
            .text(ScreenWidth / 2, ScreenHeight / 2, text, {
                fontFamily: "Arial",
                fontSize: "100px",
                color: "#ffd700",
                fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5);
    }
}
