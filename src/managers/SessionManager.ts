import { Nullable, UUID } from "definitions/utils";
import PlayerManager from "../managers/PlayerManager";
import axios from "axios";
import { api } from "../utilities/api";
import { JoinDTO, SessionDTO } from "definitions/dto";
import GeneralManager from "./GeneralManager";
import { assert } from "utilities/utils";
import { Session } from "entities/Session";
import { EventEmitter } from "utilities/EventEmitter";

class SessionManager {
    public readonly onSync: EventEmitter;
    private session: Nullable<Session>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.session = null;
    }

    public getSession(): Nullable<Session> {
        return this.session;
    }

    public hasStarted(): Nullable<boolean> {
        const session: Nullable<Session> = this.getSession();
        if (!session) {
            return null;
        }
        return session.turnPlayer !== null;
    }

    public async initialize(): Promise<void> {
        await this.handleJoin();
        this.listen();
    }

    private async handleJoin(): Promise<void> {
        await PlayerManager.validateId();
        if (PlayerManager.getId() !== null) {
            if (location.pathname.slice(1) !== "") {
                location.pathname = "";
            }
            return;
        }
        const sessionId: UUID = location.pathname.slice(1);
        if (sessionId === "") {
            return;
        }
        await this.join(sessionId);
    }

    private async join(sessionId: UUID): Promise<void> {
        const requestBody: JoinDTO = {
            sessionId: sessionId,
            playerName: PlayerManager.generateName(),
        } as JoinDTO;
        const response: axios.AxiosResponse<UUID> = await api.post(
            "/join",
            requestBody,
        );
        PlayerManager.saveId(response.data);
        location.pathname = "";
    }

    private listen(): void {
        GeneralManager.onSync.on(() => {
            const dto: Nullable<SessionDTO> = GeneralManager.getSession();
            assert(dto);
            this.session = new Session(dto);
            this.onSync.emit();
        });
    }

    public async createSession(): Promise<void> {
        const requestBody: string = PlayerManager.generateName();
        const response: axios.AxiosResponse<UUID> = await api.post(
            "/create",
            requestBody,
        );
        PlayerManager.saveId(response.data);
    }

    public async start(): Promise<void> {
        const session: Nullable<Session> = this.getSession();
        assert(session);
        const requestBody: string = session.id;
        await api.put("/distributeOrderIndex", requestBody);
        // here on server also begin turn?
    }
}

export default new SessionManager();
