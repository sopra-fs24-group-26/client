import { Nullable, UUID, int } from "definitions/utils";
import Phaser from "phaser";
import { log } from "utilities/logger";
import SessionManager from "managers/SessionManager";
import PlayerManager from "managers/PlayerManager";
import { assert, interactify } from "utilities/utils";
import { ScreenHeight, ScreenWidth } from "core/main";
import GeneralManager from "managers/GeneralManager";
import { Player } from "entities/Player";
import { Session } from "entities/Session";

export class LobbyScreen extends Phaser.Scene {
    private title: Nullable<Phaser.GameObjects.Text>;
    private quitButton: Nullable<Phaser.GameObjects.Image>;
    private shareButton: Nullable<Phaser.GameObjects.Image>;
    private startButton: Nullable<Phaser.GameObjects.Image>;
    private nameContainer: Nullable<Phaser.GameObjects.Container>;

    public constructor() {
        super("LobbyScreen");
        this.title = null;
        this.quitButton = null;
        this.shareButton = null;
        this.startButton = null;
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
        this.load.image("quit", "assets/quit.png");
        this.load.image("share", "assets/share.png");
        this.load.image("start", "assets/start.png");
    }

    public create(): void {
        this.title = this.add
            .text(ScreenWidth / 2, ScreenHeight / 8, "Saboteur Lobby", {
                fontFamily: "Goudy",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);

        this.quitButton = this.add.image(
            ScreenWidth / 4,
            ScreenHeight / 1.25,
            "quit",
        );
        interactify(this.quitButton, 0.5, () => this.onQuitButton());

        this.shareButton = this.add.image(
            ScreenWidth / 2,
            ScreenHeight / 1.25,
            "share",
        );
        interactify(this.shareButton, 0.5, () => this.onShareButton());

        this.startButton = this.add.image(
            ScreenWidth / 1.25,
            ScreenHeight / 1.25,
            "start",
        );
        interactify(this.startButton, 0.5, () => this.onStartButton());
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
            /*
            this.scene.start("GameScreen");
            */
            SessionManager.onSync.off(listener);
        });
    }

    private onQuitButton(): void {
        PlayerManager.delete();
        this.scene.start("TitleScreen");
    }

    private onShareButton(): void {
        const session: Nullable<Session> = SessionManager.getSession();
        assert(session);
        const link: string = `${location.origin}/${session.id}`;
        navigator.clipboard.writeText(link);
    }

    private onStartButton(): void {
        //server distribute roles
        log("Start");
    }

    public updateFrame(): void {
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
                        fontFamily: "Arial Black",
                        fontSize: 20,
                        color: "#e1e1e1",
                        stroke: "#000000",
                        strokeThickness: 3,
                        fontStyle: fontstyle,
                    })
                    .setOrigin(0.5, 0.5),
            );
        }
    }
}
