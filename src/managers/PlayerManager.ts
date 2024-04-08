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
}

export default new PlayerManager();
