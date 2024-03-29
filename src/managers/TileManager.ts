import { MasterTick } from "core/masterTick";
import { EventEmitter } from "utilities/EventEmitter";
import { log } from "utilities/logger";

class TileManager {
    public readonly onSync: EventEmitter;

    public constructor() {
        this.onSync = new EventEmitter();
        this.beginSync();
    }

    private beginSync(): void {
        MasterTick.on(() => {
            //fetch data from GeneralManager and update fields
            this.onSync.emit();
        });
    }
}

export default new TileManager();
