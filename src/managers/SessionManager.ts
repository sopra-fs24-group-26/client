import { Nullable, UUID } from "definitions/utils";
import PlayerManager from "../managers/PlayerManager";
import axios from "axios";
import { api } from "../utilities/api";
import { PlayerInformation, SessionInformation } from "definitions/information";
import { JoinDTO } from "definitions/dto";
import GeneralManager from "./GeneralManager";

class SessionManager {
    public constructor() {
        this.analyseURL();
    }

    public get(): Nullable<SessionInformation> {
        return GeneralManager.getSession();
    }

    public getId(): Nullable<UUID> {
        return GeneralManager.getSession()?.id || null;
    }

    public async createSession(): Promise<void> {
        const playerName: string = PlayerManager.generateName();
        const requestBody: string = playerName;
        const response: axios.AxiosResponse<PlayerInformation> = await api.post(
            "/create",
            requestBody,
        );
        PlayerManager.saveId(response.data.id);
    }

    private async analyseURL(): Promise<void> {
        if (PlayerManager.getId() !== null) {
            return;
        }
        const sessionId: UUID = location.pathname.slice(1);
        if (sessionId === "") {
            return;
        }
        const playername: string = PlayerManager.generateName();
        const requestBody: JoinDTO = {
            sessionId: sessionId,
            playerName: playername,
        } as JoinDTO;
        const response: axios.AxiosResponse<PlayerInformation> = await api.post(
            "/join",
            requestBody,
        );
        PlayerManager.saveId(response.data.id);
    }
}

export default new SessionManager();
