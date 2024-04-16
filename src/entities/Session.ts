import { SessionDTO } from "definitions/dto";
import { Nullable, UUID, int } from "definitions/utils";

export class Session {
    public readonly id: UUID;
    public readonly seed: UUID;
    public readonly turnPlayer: Nullable<int>;

    public constructor(dto: SessionDTO) {
        this.id = dto.id;
        this.seed = dto.seed;
        this.turnPlayer = dto.turnPlayer;
    }
}
