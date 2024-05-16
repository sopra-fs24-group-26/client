import { Nullable, UUID, int } from "definitions/utils";
import Phaser from "phaser";
import SessionManager from "managers/SessionManager";
import PlayerManager from "managers/PlayerManager";
import { assert, interactify } from "utilities/utils";
import { ScreenHeight, ScreenWidth } from "core/main";
import GeneralManager from "managers/GeneralManager";
import { Player } from "entities/Player";
import { Session } from "entities/Session";

export class LobbyScreen extends Phaser.Scene {
    private title: Nullable<Phaser.GameObjects.Text>;
    private nameContainer: Nullable<Phaser.GameObjects.Container>;

    public constructor() {
        super("LobbyScreen");
        this.title = null;
        this.nameContainer = null;
    }

    public init(): void {
        const updateListener: UUID = PlayerManager.onSync.on(() =>
            this.updateFrame(),
        );
        // on scene destroy free listener
        this.events.on("destroy", () => {
            GeneralManager.onSync.off(updateListener);
        });
    }

    public preload(): void {
        this.load.image("quit", "assets/buttons/quit.png");
        this.load.image("share", "assets/buttons/share.png");
        this.load.image("start", "assets/buttons/start.png");
    }

    public create(): void {
        this.title = this.add
            .text(ScreenWidth / 2, ScreenHeight / 8, "Saboteur Lobby", {
                fontFamily: "Verdana",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            } as Phaser.Types.GameObjects.Text.TextStyle)
            .setOrigin(0.5);

        const quitButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.25,
            ScreenHeight / 1.25,
            "quit",
        );
        interactify(quitButton, 0.5, () => this.onQuitButton());

        const shareButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.5,
            ScreenHeight / 1.25,
            "share",
        );
        interactify(shareButton, 0.5, () => this.onShareButton());

        const startButton: Phaser.GameObjects.Image = this.add.image(
            ScreenWidth * 0.75,
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
            if (!hasStarted) {
                return;
            }
            this.scene.start("GameScreen");
            SessionManager.onSync.off(listener);
        });
    }

    private onQuitButton(): void {
        PlayerManager.delete();
        this.scene.start("TitleScreen");
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
                fontFamily: "Verdana",
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
            //return;
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
        assert(me && this.title && others && this.nameContainer);
        this.title.text = `Saboteur Lobby\n${me.name}`;

        for (let i: int = 0; i < others.length; i++) {
            let ypos: int = ScreenHeight / 4 + (i * ScreenHeight) / 20;
            let playername: string = others[i].name;
            let fontstyle: string = "normal";
            this.nameContainer.add(
                this.add
                    .text(ScreenWidth / 2, ypos, playername, {
                        fontFamily: "Verdana",
                        fontSize: 20,
                        color: "#e1e1e1",
                        stroke: "#000000",
                        strokeThickness: 3,
                        fontStyle: fontstyle,
                    } as Phaser.Types.GameObjects.Text.TextStyle)
                    .setOrigin(0.5, 0.5),
            );
        }
    }
}
