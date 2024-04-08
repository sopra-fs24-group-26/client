import { Nullable, UUID, int } from "definitions/utils";
import Phaser from "phaser";
import { log } from "utilities/logger";
import SessionManager from "managers/SessionManager";
import PlayerManager from "managers/PlayerManager";
import { PlayerInformation } from "definitions/information";
import { assert, interactify } from "utilities/utils";
import { ScreenHeight, ScreenWidth } from "core/main";
import GeneralManager from "managers/GeneralManager";

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
        const generalManagerListener: UUID = GeneralManager.onSync.on(() => {
            this.updateFrame();
        });

        // on scene destroy free listener
        this.events.on("destroy", () => {
            GeneralManager.onSync.off(generalManagerListener);
        });
    }

    public preload(): void {
        this.load.image("testButton", "assets/testButton.png");
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
            "testButton",
        );
        interactify(this.quitButton, 1, () => this.onQuitButton());

        this.shareButton = this.add.image(
            ScreenWidth / 2,
            ScreenHeight / 1.25,
            "testButton",
        );
        interactify(this.shareButton, 1, () => this.onShareButton());

        this.startButton = this.add.image(
            ScreenWidth / 1.25,
            ScreenHeight / 1.25,
            "testButton",
        );
        interactify(this.startButton, 1, () => this.onStartButton());

        this.nameContainer = this.add.container();
    }

    private onQuitButton(): void {
        PlayerManager.removeId();
        log("playerId in local storage removed");
        log("delete player info in backend");
        this.scene.start("TitleScreen");
    }

    private onShareButton(): void {
        const sessionId: Nullable<UUID> = SessionManager.getId();
        assert(sessionId);
        const link: string = `${location.origin}/${sessionId}`;
        navigator.clipboard.writeText(link);
        log("copy link to clipboard");
    }

    private onStartButton(): void {
        log("Start");
    }

    /**
     * Deletes every child in this.container
     */
    public clearFrame(): void {
        assert(this.nameContainer);
        this.nameContainer.list.forEach((child) => child.destroy());
        this.nameContainer.removeAll();
    }

    public updateFrame(): void {
        this.clearFrame();
        const me: Nullable<PlayerInformation> = PlayerManager.getMe();
        const others: Nullable<PlayerInformation[]> = PlayerManager.getOthers();
        assert(me && this.title && others && this.nameContainer);
        this.title.text = `Saboteur Lobby\n${me.name}`;

        for (let i: int = 0; i < others.length; i++) {
            let ypos: int = ScreenHeight / 6 + (i * ScreenHeight) / 20;
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
