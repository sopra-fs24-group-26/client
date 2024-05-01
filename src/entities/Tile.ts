import { TileDTO } from "definitions/dto";
import { TileState } from "definitions/enums";
import { Nullable, UUID, int } from "definitions/utils";
import seedrandom from "seedrandom";
import { seededUUIDv4 } from "utilities/utils";

export class Tile {
    public readonly id: UUID;
    public readonly type: int;
    public state: Nullable<TileState>;
    public rotation: int;
    public coordinateX: Nullable<int>;
    public coordinateY: Nullable<int>;

    public constructor(random: seedrandom.PRNG, type: int) {
        this.id = seededUUIDv4(random);
        this.type = type;
        this.state = null;
        this.rotation = 0;
        this.coordinateX = null;
        this.coordinateY = null;
    }

    public apply(state: TileState, dto: Nullable<TileDTO>): void {
        this.state = state;
        this.rotation = dto?.rotation ?? 0;
        this.coordinateX = dto?.coordinateX ?? null;
        this.coordinateY = dto?.coordinateY ?? null;
    }

    public applyState(state: TileState): void {
        this.state = state;
    }
}
