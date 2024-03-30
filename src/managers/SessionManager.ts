import { MasterTick } from "core/masterTick";
import { UUID } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";
import { log } from "utilities/logger";

class SessionManager {
    public readonly onSync: EventEmitter;

    public constructor() {
        this.onSync = new EventEmitter();
        this.analyseURL();
        this.beginSync();
    }

    private analyseURL(): void {
        const sessionId: UUID = location.pathname.slice(1);
        log(sessionId);
    }

    private beginSync(): void {
        MasterTick.on(() => {
            //fetch data from server and update fields
            this.onSync.emit();
        });
        log(MasterTick);
    }
}

export default new SessionManager();
