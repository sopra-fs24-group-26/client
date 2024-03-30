import { MasterTick } from "core/masterTick";
import { EventEmitter } from "utilities/EventEmitter";

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
}

export default new PlayerManager();
