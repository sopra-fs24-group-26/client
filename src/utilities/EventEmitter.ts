/**
 * Copyright (C) - All Rights Reserved
 * Written by Noah Mattia Bussinger, October 2023
 */

import { UUID } from "definitions/utils";
import { AbstractEventEmitter } from "./AbstractEventEmitter";

export type EventListener = (data: any) => void;

export class EventEmitter extends AbstractEventEmitter<EventListener> {
    public constructor() {
        super();
    }

    public override once(listener: EventListener): void {
        const uuid: UUID = this.on((data: any) => {
            listener(data);
            this.off(uuid);
        });
    }

    public override emit(data: any = null): void {
        for (const [_uuid, listener] of this.listeners) {
            listener(data);
        }
    }
}
