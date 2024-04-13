import { MasterTick } from "core/masterTick";
import { Nullable, UUID } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import {
    DataInformation,
    PlayerInformation,
    SessionInformation,
    TileInformation,
} from "definitions/information";
import {
    playersNotEqual,
    sessionsNotEqual,
    tilesNotEqual,
} from "utilities/information";
import { api } from "../utilities/api";
import axios from "axios";
import PlayerManager from "./PlayerManager";
import { assert } from "utilities/utils";

class GeneralManager {
    public readonly onSync: EventEmitter;
    private data: Nullable<DataInformation>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.data = null;
        this.fetchData();
    }

    private fetchData(): void {
        MasterTick.on(async () => {
            const requestBody: Nullable<UUID> = PlayerManager.getId();
            if (requestBody === null) {
                return;
            }
            const response: axios.AxiosResponse<DataInformation> =
                await api.post("/ping", requestBody);
            if (!this.data) {
                this.data = response.data;
                this.onSync.emit();
                return;
            }
            if (this.checkUpdate(response.data)) {
                this.data = response.data;
                this.onSync.emit();
            }
        });
    }

    private checkUpdate(data: DataInformation): boolean {
        return (
            this.checkSessionUpdate(data.session) ||
            this.checkPlayersUpdate(data.players) ||
            this.checkTilesUpdate(data.tiles)
        );
    }

    private checkSessionUpdate(session: SessionInformation): boolean {
        assert(this.data);
        return sessionsNotEqual(session, this.data.session);
    }

    private checkPlayersUpdate = (players: PlayerInformation[]): boolean => {
        assert(this.data);
        if (players.length !== this.data.players.length) {
            return true;
        }
        for (let i = 0; i < players.length; i++) {
            if (playersNotEqual(players[i], this.data.players[i])) {
                return true;
            }
        }
        return false;
    };

    private checkTilesUpdate(tiles: TileInformation[]): boolean {
        assert(this.data);
        if (tiles.length !== this.data.tiles.length) {
            return true;
        }
        for (let i = 0; i < tiles.length; i++) {
            if (tilesNotEqual(tiles[i], this.data.tiles[i])) {
                return true;
            }
        }
        return false;
    }

    public getSession(): Nullable<SessionInformation> {
        return this.data?.session || null;
    }

    public getTiles(): Nullable<TileInformation[]> {
        return this.data?.tiles || null;
    }

    public getPlayers(): Nullable<PlayerInformation[]> {
        return this.data?.players || null;
    }

    public getSeed(): string {
        const session: Nullable<SessionInformation> = this.getSession();
        if (session === null) {
            throw new Error("Couldn't get Session");
        } else {
            return session.seed;
        }
    }
}

export default new GeneralManager();
