import { Nullable, int } from "definitions/utils";
import GeneralManager from "./GeneralManager";
import tileConfigs from "configs/tiles.json";
import { TileConfig } from "definitions/config";
import { assert, seededShuffle } from "utilities/utils";
import { SessionDTO, TileDTO } from "definitions/dto";
import { Tile } from "entities/Tile";
import seedrandom from "seedrandom";
import { TileState } from "definitions/enums";
import { EventEmitter } from "utilities/EventEmitter";
import PlayerManager from "./PlayerManager";
class TileManager {
    public readonly onSync: EventEmitter;
    private list: Nullable<Tile[]>;

    public constructor() {
        this.onSync = new EventEmitter();
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
            const session: Nullable<SessionDTO> = GeneralManager.getSession();
            const dtos: Nullable<TileDTO[]> = GeneralManager.getTiles();
            assert(session && dtos);
            const random: seedrandom.PRNG = seedrandom(session.seed);
            this.list = seededShuffle(
                this.getUnfolded().map(
                    (config: TileConfig) => new Tile(random, config.type),
                ),
                session.seed,
            );

            for (let i = 0; i < this.list.length; i++) {
                const tile: Tile = this.list[i];
                const dto: Nullable<TileDTO> =
                    dtos.find((dto: TileDTO) => dto.id === tile.id) || null;

                let state: TileState = this.identifyTiles(
                    dto,
                    session.turnPlayer!,
                    i,
                );
                tile.apply(state, dto);
            }
            this.onSync.emit();
        });
    }

    private identifyTiles(
        dto: Nullable<TileDTO>,
        turnPlayer: int,
        i: int,
    ): TileState {
        if (dto !== null) {
            return TileState.Placed;
        }
        if (
            i <
            turnPlayer +
                this.getStartOfGameTilesAmount(GeneralManager.getPlayers.length)
        ) {
            return TileState.Drawn;
        }
        return TileState.Unused;
    }

    private getStartOfGameTilesAmount(playerAmount: int): int {
        let amountPerPlayer: int = 4;

        if (playerAmount <= 5) {
            amountPerPlayer = 6;
        }
        if (playerAmount <= 7) {
            amountPerPlayer = 5;
        }
        return amountPerPlayer * playerAmount;
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
