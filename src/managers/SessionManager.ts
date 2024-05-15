import { int, Nullable, UUID } from "definitions/utils";
import PlayerManager from "../managers/PlayerManager";
import axios from "axios";
import { api } from "../utilities/api";
import { JoinDTO, SessionDTO } from "definitions/dto";
import GeneralManager from "./GeneralManager";
import { assert } from "utilities/utils";
import { Session } from "entities/Session";
import { EventEmitter } from "utilities/EventEmitter";
import { Player } from "../entities/Player";

class SessionManager {
    public readonly onSync: EventEmitter;
    private session: Nullable<Session>;
    private reachedGold: boolean;

    public constructor() {
        this.onSync = new EventEmitter();
        this.session = null;
        this.reachedGold = false;
    }

    public get(): Nullable<Session> {
        return this.session;
    }

    public hasStarted(): Nullable<boolean> {
        const session: Nullable<Session> = this.get();
        if (!session) {
            return null;
        }
        return session.turnIndex !== null;
    }

    public isMyTurn(): boolean {
        const session: Nullable<SessionDTO> = GeneralManager.getSession();
        const players: Nullable<Player[]> = PlayerManager.getAll();
        const me: Nullable<Player> = PlayerManager.getMe();
        assert(session && players && me);
        const playerCount: int = players.length;
        if (session.turnIndex === null) {
            return false;
        }
        return session.turnIndex % playerCount === me.orderIndex;
    }

    public isPlayersTurn(player: Player, playerCount: int): boolean {
        const session: Nullable<SessionDTO> = GeneralManager.getSession();
        assert(session);
        if (session.turnIndex === null) {
            return false;
        }
        return session.turnIndex % playerCount === player.orderIndex;
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
        try {
            const response: axios.AxiosResponse<UUID> = await api.post(
                "/join",
                requestBody,
            );
            PlayerManager.saveId(response.data);
            location.pathname = "";
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status) {
                PlayerManager.delete();
                return;
            }
            location.pathname = "";
            return;
        }
    }

    private listen(): void {
        GeneralManager.onSync.on(() => {
            const dto: Nullable<SessionDTO> = GeneralManager.getSession();
            assert(dto);
            this.session = new Session(dto);
            this.onSync.emit();
        });
    }

    public async create(): Promise<void> {
        const requestBody: string = PlayerManager.generateName();
        const response: axios.AxiosResponse<UUID> = await api.post(
            "/create",
            requestBody,
        );
        PlayerManager.saveId(response.data);
    }

    public async start(): Promise<void> {
        const session: Nullable<Session> = this.get();
        assert(session);
        const requestBody: string = session.id;
        await api.put("/start", requestBody);
    }

    public setReachedGold(): void {
        this.reachedGold = true;
    }

    public getReachedGold(): boolean {
        return this.reachedGold;
    }
}

export default new SessionManager();
