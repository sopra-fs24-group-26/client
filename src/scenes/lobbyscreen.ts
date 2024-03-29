import { Nullable, UUID, int } from "definitions/utils";
import Phaser from "phaser";
import { log } from "utilities/logger";
import SessionManager from "managers/SessionManager";
import PlayerManager from "managers/PlayerManager";
import { PlayerInformation, SessionInformation } from "definitions/information";
import { interactify } from "utilities/utils";

export class LobbyScreen extends Phaser.Scene {
    private text: Nullable<Phaser.GameObjects.Text>;
    private players: Nullable<PlayerInformation[]>;
    private me: Nullable<PlayerInformation>;
    private session: Nullable<SessionInformation>;
    private graphics: Nullable<Phaser.GameObjects.Graphics>;

    public constructor() {
        super("LobbyScreen");
        this.text = null;
        this.players = null;
        this.me = null;
        this.session = null;
        this.graphics = null;
    }

    public syncPlayers(): void {
        this.players = PlayerManager.getPlayers();
    }

    public syncMe(): void {
        this.me = PlayerManager.getMe();
    }

    public syncSession(): void {
        this.session = SessionManager.getSessionInformation();
    }

    private onQuitButton(): void {
        log("Quit");
    }

    private onStartButton(): void {
        log("Start");
    }

    private onInviteButton(): void {
        navigator.clipboard.writeText("URL/join/" + this.me?.sessionId);
        log("copy link to clipboard");
    }

    public init(): void {
        const playerManagerListener: UUID = PlayerManager.onSync.on(() => {
            this.syncPlayers();
            this.syncMe();
            this.updateFrame();
        });
        const sessionManagerListener: UUID = SessionManager.onSync.on(() => {
            this.syncSession();
            this.updateFrame();
        });

        // on scene destroy free listener
        this.events.on("destroy", () => {
            PlayerManager.onSync.off(playerManagerListener);
            SessionManager.onSync.off(sessionManagerListener);
        });
    }

    public preload(): void {
        this.load.image("testButton", "assets/testButton.png");
    }

    public create(): void {
        this.text = this.add
            .text(350, 80, "Saboteur Lobby", {
                fontFamily: "Goudy",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);

        const startButton: Phaser.GameObjects.Image = this.add.image(
            150,
            540,
            "testButton",
        );
        startButton.setInteractive();
        interactify(startButton, 1, this.onInviteButton);
    }

    private playerBackground(ypos: integer): void {
        // Placeholder for the background on player display
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0x000000, 1);
        this.graphics.fillStyle(0x5c4033, 1.0);
        // xpos, ypos, horizontal length, vertical length, corner radius
        this.graphics.fillRoundedRect(100, ypos, 600, 27, 5);
        this.graphics.strokeRoundedRect(100, ypos, 600, 27, 5);
    }

    public clearFrame(): void {
        this.graphics?.clear();
        this.text?.destroy();
        this.children.each(function (child) {
            if (child instanceof Phaser.GameObjects.Image) {
                // Check if the child is an image
                child.destroy(); // Remove the image from the scene
            }
        });
    }

    public updateFrame(): void {
        this.clearFrame();
        this.create();
        const currentLength = this.players?.length ?? 0;
        for (let i: int = 0; i < currentLength; i++) {
            let ypos: int = 150 + i * 30;
            let playername: string = (this.players ?? [])[i].name;
            let fontstyle: string = "normal";
            if (playername === this.me?.name) {
                playername = "You are: " + playername + ", Role: TBD";
                fontstyle = "oblique";
            }
            this.playerBackground(ypos);
            this.add.text(100, ypos, playername, {
                fontFamily: "Arial Black",
                fontSize: 20,
                color: "#e1e1e1",
                stroke: "#000000",
                strokeThickness: 3,
                fontStyle: fontstyle,
            });
        }
    }
}
