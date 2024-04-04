import { MasterTick } from "core/masterTick";
import { UUID } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import { log } from "utilities/logger";
import PlayerManager from "../managers/PlayerManager";
import axios from "axios";
import { api } from "../utilities/api";

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
    async createSession(): Promise<string> {
        const playerName = PlayerManager.generateName();

        const requestBody = playerName;
        log(playerName);
        const response: axios.AxiosResponse<PlayerDTO> = await api.post(
            "/user",
            requestBody,
        );
        localStorage.setItem("playerId", response.data.playerId);
        return response.data.sessionId;
    }
}
type PlayerDTO = {
    username: string;
    playerId: string;
    sessionId: string;
};

export default new SessionManager();
