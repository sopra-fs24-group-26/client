import { PlayerDTO, SessionDTO } from "definitions/dto";
import { int, Nullable, UUID } from "../definitions/utils";
import { assert } from "../utilities/utils";
import GeneralManager from "./GeneralManager";
import { Player } from "entities/Player";
import { api } from "utilities/api";
import axios from "axios";
import { EventEmitter } from "utilities/EventEmitter";
import nameGeneration from "configs/nameGeneration.json";

class PlayerManager {
    public readonly onSync: EventEmitter;
    private list: Nullable<Player[]>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.list = null;
    }

    public saveId(id: UUID): void {
        localStorage.setItem("playerId", id);
    }

    public removeId(): void {
        localStorage.removeItem("playerId");
    }

    public getId(): Nullable<UUID> {
        return localStorage.getItem("playerId") || null;
    }

    public getAll(): Nullable<Player[]> {
        return this.list;
    }

    public getMe(): Nullable<Player> {
        const players: Nullable<Player[]> = this.getAll();
        if (!players) {
            return null;
        }
        return (
            players.filter((player: Player) => player.id === this.getId())[0] ||
            null
        );
    }

    public getOthers(): Nullable<Player[]> {
        const players: Nullable<Player[]> = this.getAll();
        if (!players) {
            return null;
        }
        return players.filter((player: Player) => player.id !== this.getId());
    }

    public initialize(): void {
        this.listen();
    }

    private listen(): void {
        GeneralManager.onSync.on(() => {
            const session: Nullable<SessionDTO> = GeneralManager.getSession();
            const dtos: Nullable<PlayerDTO[]> = GeneralManager.getPlayers();
            assert(session && dtos);
            this.list = dtos.map(
                (dto: PlayerDTO) => new Player(dto, dtos.length, session.seed),
            );
            this.onSync.emit();
        });
    }

    public async validateId(): Promise<void> {
        const id: Nullable<UUID> = this.getId();
        if (!id) {
            return;
        }
        const requestBody: string = id;
        const response: axios.AxiosResponse<boolean> = await api.post(
            "/validate",
            requestBody,
        );
        if (!response.data) {
            this.removeId();
        }
    }

    public async delete(): Promise<void> {
        const id: Nullable<UUID> = this.getId();
        if (!id) {
            return;
        }
        this.removeId();
        const requestBody: string = id;
        await api.post("/deletePlayer", requestBody);
    }

    public generateName(): string {
        const prefixes: string[] = nameGeneration.prefixes;
        const titles: string[] = nameGeneration.titles;
        const names: string[] = nameGeneration.names;
        const prefix: int = Math.floor(Math.random() * prefixes.length);
        const title: int = Math.floor(Math.random() * titles.length);
        const name: int = Math.floor(Math.random() * names.length);
        return `${prefixes[prefix]} ${titles[title]} ${names[name]}`;
    }
}

export default new PlayerManager();
