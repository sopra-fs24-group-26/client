/**
 * Copyright (C) - All Rights Reserved
 * Written by Noah Mattia Bussinger, October 2023
 */

import { UUID } from "definitions/utils";
import { UUIDv4 } from "./utils";

export abstract class AbstractEventEmitter<T> {
    protected readonly listeners: Map<UUID, T>;
    protected isClosed: boolean;

    protected constructor() {
        this.listeners = new Map<UUID, T>();
        this.isClosed = false;
    }

    public abstract once(listener: T): void;

    public on(listener: T): UUID {
        if (this.isClosed) {
            throw new Error("AbstractEventEmitter: Is closed.");
        }
        const uuid: UUID = UUIDv4();
        this.listeners.set(uuid, listener);
        return uuid;
    }

    public off(uuid: UUID): void {
        this.listeners.delete(uuid);
    }

    public clear(): void {
        this.listeners.clear();
    }

    public abstract emit(data: any): void;

    public close(): void {
        this.isClosed = true;
    }

    public destroy(): void {
        this.clear();
        this.close();
    }
}
