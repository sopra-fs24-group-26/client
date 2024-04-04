import { MasterTick } from "core/masterTick";
import { EventEmitter } from "utilities/EventEmitter";
import { Nullable } from "../definitions/utils";

class PlayerManager {
    public readonly onSync: EventEmitter;

    public constructor() {
        this.onSync = new EventEmitter();
        this.beginSync();
    }

    private beginSync(): void {
        MasterTick.on(() => {
            //fetch data from server and update fields
            this.onSync.emit();
        });
    }
    static getPlayerId(): Nullable<string> {
        let playerId: Nullable<string>;
        playerId = localStorage.getItem("playerId");
        return playerId;
    }
    generateName(): string {
        const prefix = [
            "Sir ",
            "Dr. ",
            "Madam ",
            "My ",
            "General ",
            "Crazy ",
            "Blue ",
            "Lady ",
        ];
        const title = [
            "Lord ",
            "med. ",
            "Knight ",
            "Horny ",
            "Ugly ",
            "King ",
            "Queen ",
        ];
        const names = [
            "Nightingale",
            "Einstein",
            "of Rivia",
            "Lancelot",
            "Targaryen",
            "Karen",
            "Poopybutthole",
            "of the Migros",
        ];
        let maxPrefix = prefix.length;
        let maxTitle = title.length;
        let maxName = names.length;

        const randomPrefix = Math.floor(Math.random() * maxPrefix);
        const randomTitle = Math.floor(Math.random() * maxTitle);
        const randomName = Math.floor(Math.random() * maxName);

        let username =
            prefix[randomPrefix] + title[randomTitle] + names[randomName];

        return username;
    }
}

export default new PlayerManager();
