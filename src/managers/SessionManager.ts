import { MasterTick } from "core/masterTick";
import { UUID } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import { log } from "utilities/logger";
import PlayerManager from "../managers/PlayerManager";
import axios from "axios";
import { api } from "../utilities/api";
import { PlayerDTO } from "../definitions/dto";
import { SessionInformation } from "definitions/information";
import { JoinDTO } from "definitions/dto";
import GeneralManager from "./GeneralManager";
import PlayerManager from "./PlayerManager";
import { api } from "utilities/api";
import { generateRandomString } from "utilities/utils";

class SessionManager {
    public readonly onSync: EventEmitter;

    private information: Nullable<SessionInformation>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.information = null;
        this.analyseURL();
        this.beginSync();
    }

    private analyseURL(): void {
        const sessionId: UUID = location.pathname.slice(1);
        const playername: string = generateRandomString(10);
        const requestBody: JoinDTO = {
            sessionId: sessionId,
            playername: playername,
        };
        //handshake(join)
        //const response = api.post("/join", requestBody);
        log("Simulate post request with: ");
        log(sessionId + playername);
    }

    /*
    private mock(): boolean {
        //fetch data from GeneralManager and update fields
        log("Request server for session information");

        this.information = {
            sessionId: "123",
            playerCount: 1,
            turnPlayer: null,
        } as SessionInformation;
        return false;
    }
    */

    private beginSync(): void {
        MasterTick.on(() => {
            //fetch data from GeneralManager and update fields
            const b: boolean = this.checkSessionUpdate(
                GeneralManager.getSessionFromServer(),
            );
            if (b) {
                this.onSync.emit();
            }
        });
    }

    public getSessionInformation(): Nullable<SessionInformation> {
        return this.information;
    }

    public async createSession(): Promise<string> {
        const playerName: string = PlayerManager.generateName();

        const requestBody: string = playerName;
        log(playerName);
        const response: axios.AxiosResponse<PlayerDTO> = await api.post(
            "/create",
            requestBody,
        );
        localStorage.setItem("playerId", response.data.playerId);
        const session: string = response.data.sessionId;
        return session;
    }
}

export default new SessionManager();
