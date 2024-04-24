import { int, Nullable, UUID } from "./utils";

export class PlaceTile{
    public id: Nullable<UUID>;
    public type: Nullable<int>;
    public sessionId: Nullable<UUID>;
    public rotation: int;
    public coordinateX: Nullable<int>;
    public coordinateY: Nullable<int>;

    constructor() {
        this.id = null;
        this.type = null;
        this.sessionId = null;
        this.rotation = 0;
        this.coordinateX = null;
        this.coordinateY = null;
    }
}