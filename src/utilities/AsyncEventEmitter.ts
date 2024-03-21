/**
 * Copyright (C) - All Rights Reserved
 * Written by Noah Mattia Bussinger, October 2023
 */

import { UUID } from "../definitions/utils.js";
import { AbstractEventEmitter } from "./AbstractEventEmitter.js";

export type AsyncEventListener = (data: any) => Promise<void>;

export class AsyncEventEmitter extends AbstractEventEmitter<AsyncEventListener> {
    public override once(listener: AsyncEventListener): void {
        const uuid: UUID = this.on(async (data: any) => {
            await listener(data);
            this.off(uuid);
        });
    }

    public override async emit(data: any = null): Promise<void> {
        for (const [_uuid, listener] of this.listeners) {
            await listener(data);
        }
    }
}
