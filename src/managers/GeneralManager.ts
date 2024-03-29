import { MasterTick } from "core/masterTick";
import { Nullable, UUID, int } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import {
    DataInformation,
    PlayerInformation,
    SessionInformation,
    TileInformation,
} from "definitions/information";
import {
    playersNotEqual,
    tilesNotEqual,
    sessionsNotEqual,
} from "utilities/information";
import { log } from "utilities/logger";
import SessionManager from "./SessionManager";
import { api } from "../utilities/api";
import axios from "axios";
import PlayerManager from "./PlayerManager";

class GeneralManager {
    public readonly onSync: EventEmitter;
    private data: Nullable<DataInformation>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.data = null;
        this.fetchData();
    }

    private checkUpdate(response: axios.AxiosResponse<DataInformation>): boolean {
        return (
            this.checkPlayersUpdate(response.data.players) ||
            this.checkMeUpdate(response.data.player) ||
            this.checkSessionUpdate(response.data.session) ||
            this.checkTilesUpdate(response.data.tiles)
        );
    }

    private fetchData(): void {
        MasterTick.on(async () => {
            //fetch data from server and update fields

            //use sessionId as post request body
            const requestBody: Nullable<UUID> =
                PlayerManager.getMe()?.id || null;
            log("Request body: " + requestBody);
            if (requestBody === null) {
                return;
            }
            const response: axios.AxiosResponse<DataInformation> =
                await api.post("/ping", requestBody);
            if(this.data === null){
                this.data = response.data;            
            }
            if (this.checkUpdate(response)){
                this.onSync.emit();
            }
        });
    }

    // returns true if there is a playernames in lobby has to be updated
    // updates this.players if necessary (array.slice(0) to make a copy of array)
    private checkPlayersUpdate = (
        serverResponse: PlayerInformation[],
    ): boolean => {
        const responseLength: int = serverResponse.length;
        const currentLength: Nullable<int> = this.data?.players.length || null;
        if (currentLength === null) {
            return false;
        }
        if (responseLength !== currentLength) {
            this.data?.players? = serverResponse.slice(0) || null;
            return true;
        }
        for (let i = 0; i < responseLength; i++) {
            if (playersNotEqual(serverResponse[i], this.data.players[i])) {
                this.data.players = serverResponse.slice(0);
                return true;
            }
        }
        return false;
    };

    //returns true if information about this.me is changed
    //updates this.me if necessary
    private checkMeUpdate(
        serverResponse: Nullable<PlayerInformation>,
    ): boolean {
        //if this.me not equals to serverResponse, some change is made, return true
        if (playersNotEqual(this.data?.player, serverResponse)) {
            this.data?.player = serverResponse;
            return true;
        }
        return false;
    }


    private checkSessionUpdate(
        serverResponse: Nullable<SessionInformation>,
    ): boolean {
        //no information received from server yet
        if (serverResponse === null) {
            return false;
        }
        let res: boolean = false;
        if (
            serverResponse.playerCount !==
                (this.data.information?.playerCount ?? 0) ||
            serverResponse.turnPlayer !== this.data.information?.turnPlayer
        ) {
            this.data.information = serverResponse;
            res = true;
        }
        return res;
    }

    private checkTilesUpdate( serverResponse: TileInformation): boolean {
        
        return tilesNotEqual(this.data.tiles, serverResponse);
    }

    public getMeFromServer(): Nullable<PlayerInformation> {
        if (this.data?.player === undefined) {
            return null;
        }
        return this.data?.player;
    }

    public getSessionFromServer(): Nullable<SessionInformation> {
        if (this.data?.session === undefined) {
            return null;
        }
        return this.data?.session;
    }

    public getPlayersFromServer(): PlayerInformation[] {
        if (this.data?.players === undefined) {
            return [];
        }
        return this.data?.players;
    }

    public getTiles(): TileInformation[] {
        if (this.data?.tiles === undefined) {
            return [];
        }
        return this.data?.tiles;
    }
}

export default new GeneralManager();
