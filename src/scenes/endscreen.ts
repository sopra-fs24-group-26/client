import { Nullable, float, int } from "definitions/utils";
import SessionManager from "managers/SessionManager";
import Phaser from "phaser";
import { assert, interactify } from "../utilities/utils";
import { ScreenHeight, ScreenWidth } from "../core/main";
import PlayerManager from "managers/PlayerManager";
import { Player } from "entities/Player";
import { Role } from "definitions/enums";
import TileManager from "managers/TileManager";
import { GameUiScreen } from "./gameuiscreen";
import { Session } from "entities/Session";

export class EndScreen extends Phaser.Scene {
    private profilesContainer: Nullable<Phaser.GameObjects.Container>;

    public constructor() {
        super("EndScreen");
        this.profilesContainer = null;
    }

    public init(): void {
        this.displayProfiles();
    }

    public preload(): void {
        this.load.image("quit", "assets/buttons/quit.png");
        this.load.image("goldNugget", "assets/particles/goldNugget.png");
        this.load.image("coalNugget", "assets/particles/coalNugget.png");
    }

    public create(): void {
        this.displayByRole();
        this.profilesContainer = this.add.container();
        this.displayProfiles();
        PlayerManager.removeId();
        TileManager.clearReachedCoal();
        SessionManager.resetReachedGold();

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
        const reachedGold: boolean = SessionManager.getReachedGold();
        const minerWin: boolean = me.role === Role.Miner && reachedGold;
        const saboteurWin: boolean = me.role === Role.Saboteur && !reachedGold;
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
                fontFamily: "Monocraft",
                fontSize: "100px",
                color: "#fbfcfc",
                fontStyle: "bold",
            } as Phaser.Types.GameObjects.Text.TextStyle)
            .setOrigin(0.5, 0.5);
    }

    private displayProfiles(): void {
        if (!this.profilesContainer) {
            return;
        }
        const all: Nullable<Player[]> = PlayerManager.getAll();
        const me: Nullable<Player> = PlayerManager.getMe();
        const session: Nullable<Session> = SessionManager.get();
        assert(me && all && session);
        this.profilesContainer.removeAll(true);
        const count: int = all.length;
        const spacing: int =
            (ScreenWidth - count * GameUiScreen.profilePixels) / (count + 1);
        const y: float = ScreenHeight / 10;
        for (let i = 0; i < count; i++) {
            this.displayPlayer(all, spacing, i, y, me);
        }
    }

    private displayPlayer(
        all: Player[],
        spacing: int,
        i: int,
        y: float,
        me: Player,
    ): void {
        assert(this.profilesContainer);
        const player: Player = all[i];
        const x: float =
            spacing +
            GameUiScreen.profilePixels / 2 +
            i * (GameUiScreen.profilePixels + spacing);

        let name: string = player.name;
        if (all[i].orderIndex === me.orderIndex) {
            name += " (Me)";
        }
        const profile: Phaser.GameObjects.Image = this.add.image(
            x,
            y,
            `avatar${player.orderIndex}`,
        );
        this.profilesContainer.add(profile);
        this.addRole(x, y, player);
        this.addName(x, y, name);
    }

    private addRole(x: float, y: float, player: Player): void {
        assert(this.profilesContainer);
        const roleString: string =
            player.role === Role.Saboteur ? "Saboteur" : "Miner";
        const roleText: Phaser.GameObjects.Text = this.add.text(
            x,
            y - GameUiScreen.profilePixels,
            roleString,
            {
                fontFamily: "Monocraft",
                fontSize: "30px",
                color: "#ffffff",
                fontStyle: "bold",
            } as Phaser.Types.GameObjects.Text.TextStyle,
        );
        roleText.setOrigin(0.5, 0.5);
        this.profilesContainer.add(roleText);
    }

    private addName(x: float, y: float, name: string): void {
        assert(this.profilesContainer);
        const nameText: Phaser.GameObjects.Text = this.add.text(
            x,
            y + GameUiScreen.profilePixels / 1.2,
            name,
            {
                fontFamily: "Monocraft",
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold",
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle,
        );
        nameText.setOrigin(0.5, 0);
        nameText.setWordWrapWidth(GameUiScreen.profilePixels * 3);
        this.profilesContainer.add(nameText);
    }
}
