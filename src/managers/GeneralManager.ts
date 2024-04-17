import { MasterTick } from "core/masterTick";
import { Nullable, UUID } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import { api } from "../utilities/api";
import axios from "axios";
import PlayerManager from "./PlayerManager";
import { DataDTO, SessionDTO, PlayerDTO, TileDTO } from "definitions/dto";

class GeneralManager {
    public readonly onSync: EventEmitter;
    private data: Nullable<DataDTO>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.data = null;
    }

    public async initialize(): Promise<void> {
        await this.fetchData();
    }

    private async fetchData(): Promise<void> {
        await this.ping();
        MasterTick.on(async () => await this.ping());
    }

    private async ping(): Promise<void> {
        const requestBody: Nullable<UUID> = PlayerManager.getId();
        if (requestBody === null) {
            return;
        }
        const response: axios.AxiosResponse<DataDTO> = await api.post(
            "/ping",
            requestBody,
        );
        this.data = response.data;
        this.onSync.emit();
    }

    public getSession(): Nullable<SessionDTO> {
        return this.data?.session || null;
    }

    public getTiles(): Nullable<TileDTO[]> {
        return this.data?.tiles || null;
    }

    public getPlayers(): Nullable<PlayerDTO[]> {
        return this.data?.players || null;
    }
}

export default new GeneralManager();
