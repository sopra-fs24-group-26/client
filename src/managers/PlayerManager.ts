import { MasterTick } from "core/masterTick";
import { Nullable } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import { int, Nullable } from "../definitions/utils";
import { PlayerInformation } from "definitions/information";
import { playersNotEqual } from "utilities/information";
import { log } from "utilities/logger";
import { generateRandomString } from "utilities/utils";
import GeneralManager from "./GeneralManager";

class PlayerManager {
    public readonly onSync: EventEmitter;
    private players: Nullable<PlayerInformation[]>;
    private me: Nullable<PlayerInformation>;

    public constructor() {
        this.players = null;
        this.me = null;
        this.onSync = new EventEmitter();
        this.beginSync();
    }

    private mock(): boolean {
        //purpose of function mock: simulate fetch data from server (GeneralManager) and update fields

        const randomname = generateRandomString(10);
        //replace next line with result of get request
        if ((this.players?.length ?? 0) < 10) {
            let p = {
                sessionId: "mockSessionID",
                id: "ID" + randomname,
                name: randomname,
                role: null,
                orderIndex: null,
            } as PlayerInformation;
            this.players?.push(p);
            //for testing purpose
            log("Update playername: " + randomname);
            return true;
        } else {
            return false;
        }
    }

    private mockCreater(): void {
        const mockPlayer = {
            sessionId: "mockSessionID",
            id: "IDMockLongname",
            name: "Longname_Lancelotmylady_Poopybutthole",
            role: null,
            orderIndex: null,
        } as PlayerInformation;
        this.players = [mockPlayer];
        this.me = mockPlayer;
    }

    private beginSync(): void {
        this.mockCreater();
        MasterTick.on(() => {
            //fetch data from GeneralManager and update fields

            const b = this.mock();
            //mock players joining lobby, emit update players event if there is a change in playername
            if (b) {
                // no need to update this.playernames here because it is updated in this.mock()
                this.onSync.emit();
            }

            // official version

            // update this.players if necessary
            const updatePlayers: boolean = this.checkPlayersUpdate(
                GeneralManager.getPlayersFromServer(),
            );
            //update this.me if necessary
            const updateMe: boolean = this.checkMeUpdate(
                GeneralManager.getMeFromServer(),
            );
            if (updatePlayers || updateMe) {
                this.onSync.emit();
            }
        });
    }

    public generateName(): string {
        const prefix: string[] = [
            "Sir ",
            "Dr. ",
            "Madam ",
            "My ",
            "General ",
            "Crazy ",
            "Blue ",
            "Lady ",
        ];
        const title: string[] = [
            "Lord ",
            "med. ",
            "Knight ",
            "Horny ",
            "Ugly ",
            "King ",
            "Queen ",
        ];
        const names: string[] = [
            "Nightingale",
            "Einstein",
            "of Rivia",
            "Lancelot",
            "Targaryen",
            "Karen",
            "Poopybutthole",
            "of the Migros",
        ];
        const maxPrefix: int = prefix.length;
        const maxTitle: int = title.length;
        const maxName: int = names.length;

        const randomPrefix: int = Math.floor(Math.random() * maxPrefix);
        const randomTitle: int = Math.floor(Math.random() * maxTitle);
        const randomName: int = Math.floor(Math.random() * maxName);

        const username: string =
            prefix[randomPrefix] + title[randomTitle] + names[randomName];

        return username;
    }

    public getPlayerId(): Nullable<string> {
        return localStorage.getItem("playerId") || null;
    }

    public getPlayers(): Nullable<PlayerInformation[]> {
        return this.players?.slice(0) ?? null;
    }

    public getMe(): Nullable<PlayerInformation> {
        return this.me;
    }
}

export default new PlayerManager();
