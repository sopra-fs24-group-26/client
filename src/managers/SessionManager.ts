import { MasterTick } from "core/masterTick";
import { UUID } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import { log } from "utilities/logger";
import PlayerManager from "../managers/PlayerManager";
import axios from "axios";
import { api } from "../utilities/api";
import { PlayerDTO } from "../definitions/dto";

class SessionManager {
    public readonly onSync: EventEmitter;

    public constructor() {
        this.onSync = new EventEmitter();
        this.analyseURL();
        this.beginSync();
    }

    private analyseURL(): void {
        const sessionId: UUID = location.pathname.slice(1);
        log(sessionId);
    }

    private beginSync(): void {
        MasterTick.on(() => {
            //fetch data from server and update fields
            this.onSync.emit();
        });
        log(MasterTick);
    }

    public async createSession(): Promise<string> {
        const playerName: string = PlayerManager.GenerateName();

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
