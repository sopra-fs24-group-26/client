import { Nullable, int } from "definitions/utils";
import GeneralManager from "./GeneralManager";
import tileConfigs from "configs/tiles.json";
import { TileConfig } from "definitions/config";
import { assert, seededShuffle } from "utilities/utils";
import { TileDTO } from "definitions/dto";
import { Tile } from "entities/Tile";
import seedrandom from "seedrandom";
import { Session } from "entities/Session";
import SessionManager from "./SessionManager";
import { TileState } from "definitions/enums";

class TileManager {
    private list: Nullable<Tile[]>;

    public constructor() {
        this.list = null;
    }

    public getAll(): Nullable<Tile[]> {
        return this.list;
    }

    public initialize(): void {
        this.listen();
    }

    private listen(): void {
        GeneralManager.onSync.on(() => {
            const session: Nullable<Session> = SessionManager.getSession();
            const dtos: Nullable<TileDTO[]> = GeneralManager.getTiles();
            assert(session && dtos);
            const random: seedrandom.PRNG = seedrandom(session.seed);
            this.list = seededShuffle(
                this.getUnfolded().map(
                    (config: TileConfig) => new Tile(random, config.type),
                ),
                session.seed,
            );
            this.list.forEach((tile: Tile) => {
                const state: TileState = TileState.Unused; // TODO
                const dto: Nullable<TileDTO> =
                    dtos.find((dto: TileDTO) => dto.id === tile.id) || null;
                assert(dto);
                tile.apply(state, dto);
            });
        });
    }

    private getUnfolded(): TileConfig[] {
        const result: TileConfig[] = [];
        for (const config of tileConfigs) {
            for (let i: int = 0; i < config.amount; i++) {
                result.push(config);
            }
        }
        return result;
    }
}

export default new TileManager();
