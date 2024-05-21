import { Nullable, UUID, int } from "definitions/utils";
import Phaser from "phaser";
import SessionManager from "managers/SessionManager";
import PlayerManager from "managers/PlayerManager";
import { assert, interactify } from "utilities/utils";
import { ScreenHeight, ScreenWidth } from "core/main";
import { Player } from "entities/Player";
import { Session } from "entities/Session";

export class LobbyScreen extends Phaser.Scene {
    private title: Nullable<Phaser.GameObjects.Text>;
    private meName: Nullable<Phaser.GameObjects.Text>;
    private nameContainer: Nullable<Phaser.GameObjects.Container>;

    public constructor() {
        super("LobbyScreen");
        this.title = null;
        this.meName = null;
        this.nameContainer = null;
    }

    public init(): void {
        const updateListener: UUID = PlayerManager.onSync.on(() =>
            this.updateFrame(),
        );
        this.events.once("shutdown", () =>
            PlayerManager.onSync.off(updateListener),
        );
    }

    public preload(): void {
        this.load.image("share", "assets/buttons/share.png");
        this.load.image("start", "assets/buttons/start.png");
        this.load.image("gamerules", "assets/buttons/gamerules.png");
    }

    public create(): void {
        this.title = this.add
            .text(ScreenWidth / 2, ScreenHeight / 8, "Saboteur Lobby", {
                fontFamily: "VT323",
                fontSize: 50,
                color: "#c06b0b",
                align: "center",
                fontStyle: "bold",
            } as Phaser.Types.GameObjects.Text.TextStyle)
            .setOrigin(0.5);

        this.meName = this.add
            .text(ScreenWidth / 2, ScreenHeight / 8 + 50, "", {
                fontFamily: "VT323",
                fontSize: 30,
                color: "#ffffff",
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle)
            .setOrigin(0.5);

        const quitButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.2,
            ScreenHeight / 1.25,
            "quit1",
        );
        interactify(quitButton, 0.5, () => this.onQuitButton());

        const shareButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.4,
            ScreenHeight / 1.25,
            "share",
        );
        interactify(shareButton, 0.5, () => this.onShareButton());

        const gameRulesButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.6,
            ScreenHeight / 1.25,
            "gamerules",
        );
        interactify(gameRulesButton, 0.5, () => this.onGameRulesButton());

        const startButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.8,
            ScreenHeight / 1.25,
            "start",
        );
        interactify(startButton, 0.5, () => this.onStartButton());

        this.nameContainer = this.add.container();

        this.portToCorrectScene();
    }

    private portToCorrectScene(): void {
        const listener: UUID = SessionManager.onSync.on(() => {
            const hasStarted: Nullable<boolean> = SessionManager.hasStarted();
            assert(hasStarted !== null);
            if (!hasStarted || this.scene.isActive("GameRulesScreen")) {
                return;
            }
            this.scene.start("GameScreen");
            SessionManager.onSync.off(listener);
        });
        this.events.once("shutdown", () => SessionManager.onSync.off(listener));
    }

    private onQuitButton(): void {
        PlayerManager.delete();
        this.scene.start("TitleScreen");
    }

    private onGameRulesButton(): void {
        this.scene.start("GameRulesScreen");
    }

    private onShareButton(): void {
        const duration: int = 3;
        const session: Nullable<Session> = SessionManager.get();
        assert(session);
        const link: string = `${location.origin}/${session.id}`;
        navigator.clipboard.writeText(link);
        const msg: Phaser.GameObjects.Text = this.add.text(
            ScreenWidth / 2,
            ScreenHeight * 0.9,
            "Share link copied to clipboard",
            {
                fontFamily: "VT323",
                fontSize: "36px",
                fontStyle: "bold",
                color: "#ffc65b",
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle,
        );
        msg.setOrigin(0.5, 0.5);
        this.time.delayedCall(duration * 1_000, () => msg.destroy());
    }

    private async onStartButton(): Promise<void> {
        const all: Nullable<Player[]> = PlayerManager.getAll();
        if (!all || all.length < 3) {
            const duration: int = 3;
            const msg: Phaser.GameObjects.Text = this.add.text(
                ScreenWidth / 2,
                ScreenHeight * 0.85,
                "Can't start with less than 3 players",
                {
                    fontFamily: "VT323",
                    fontSize: "36px",
                    fontStyle: "bold",
                    color: "#ffc65b",
                    align: "center",
                } as Phaser.Types.GameObjects.Text.TextStyle,
            );
            msg.setOrigin(0.5, 0.5);
            this.time.delayedCall(duration * 1_000, () => msg.destroy());
            return;
        }
        await SessionManager.start();
        this.scene.start("GameScreen");
    }

    private updateFrame(): void {
        if (!this.scene || !this.scene?.isActive?.()) {
            return;
        }
        assert(this.nameContainer);
        this.nameContainer.removeAll(true);

        const me: Nullable<Player> = PlayerManager.getMe();
        const others: Nullable<Player[]> = PlayerManager.getOthers();
        assert(me && this.meName && others && this.nameContainer);
        this.meName.text = `${me.name} (me)`;

        for (let i: int = 0; i < others.length; i++) {
            let ypos: int = ScreenHeight / 8 + (i + 1) * 30 + 50
            let playername: string = others[i].name;
            let fontstyle: string = "normal";
            this.nameContainer.add(
                this.add
                    .text(ScreenWidth / 2, ypos, playername, {
                        fontFamily: "VT323",
                        fontSize: 30,
                        color: "#ffffff",
                        fontStyle: fontstyle,
                    } as Phaser.Types.GameObjects.Text.TextStyle)
                    .setOrigin(0.5, 0.5),
            );
        }
    }
}
