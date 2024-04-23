import { int, Nullable, UUID } from "./utils";

export class PlaceTile{
    public id: Nullable<UUID>;
    public sessionId: Nullable<UUID>;
    public rotation: int;
    public coordinateX: Nullable<int>;
    public coordinateY: Nullable<int>;

    constructor() {
        this.id = null;
        this.sessionId = null;
        this.rotation = 0;
        this.coordinateX = null;
        this.coordinateY = null;
    }
}