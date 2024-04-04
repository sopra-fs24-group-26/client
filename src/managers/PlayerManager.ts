import { MasterTick } from "core/masterTick";
import { EventEmitter } from "utilities/EventEmitter";
import { int, Nullable } from "../definitions/utils";

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

    public GenerateName(): string {
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
        let maxPrefix: int = prefix.length;
        let maxTitle: int = title.length;
        let maxName: int = names.length;

        const randomPrefix: int = Math.floor(Math.random() * maxPrefix);
        const randomTitle: int = Math.floor(Math.random() * maxTitle);
        const randomName: int = Math.floor(Math.random() * maxName);

        let username: string =
            prefix[randomPrefix] + title[randomTitle] + names[randomName];

        return username;
    }

    public getPlayerId(): Nullable<string> {
        let playerId: Nullable<string>;
        playerId = localStorage.getItem("playerId") || null;
        return playerId;
    }
}

export default new PlayerManager();
