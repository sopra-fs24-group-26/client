import { SessionInformation, TileInformation } from "definitions/information";
import { Nullable, UUID, int } from "definitions/utils";
import GeneralManager from "./GeneralManager";
import tiles from "configs/tiles.json";
import { TileConfig } from "definitions/config";
import { log } from "utilities/logger";
import { assert, seededShuffle } from "utilities/utils";

class TileManager {
    private readonly config: TileConfig[];

    public constructor() {
        this.config = tiles;
    }

    public getAll(): Nullable<TileInformation[]> {
        return GeneralManager.getTiles();
    }

    public getUnfolded(): TileConfig[] {
        const session: Nullable<SessionInformation> =
            GeneralManager.getSession();
        const result: TileConfig[] = [];
        assert(session);
        for (const tile of this.config) {
            for (let i: int = 0; i < tile.amount; i++) {
                result.push(tile);
            }
            log(tile);
        }
        return result;
    }

    public getShuffled(): TileConfig[] {
        const session: Nullable<SessionInformation> =
            GeneralManager.getSession();
        assert(session);
        return seededShuffle(this.getUnfolded(), session.seed);
    }
}

export default new TileManager();
