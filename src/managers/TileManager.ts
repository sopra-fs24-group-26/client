import { Nullable, int } from "definitions/utils";
import GeneralManager from "./GeneralManager";
import tileConfigs from "configs/tiles.json";
import { TileConfig } from "definitions/config";
import { assert, seededShuffle } from "utilities/utils";
import { PlayerDTO, SessionDTO, TileDTO } from "definitions/dto";
import { Tile } from "entities/Tile";
import seedrandom from "seedrandom";
import { TileState } from "definitions/enums";
import { EventEmitter } from "utilities/EventEmitter";
import PlayerManager from "./PlayerManager";
import { Player } from "entities/Player";

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

    public getInHand(): Tile[] {
        const players: Nullable<PlayerDTO[]> = GeneralManager.getPlayers();
        const me: Nullable<Player> = PlayerManager.getMe();
        const all: Nullable<Tile[]> = this.list;
        assert(me && all && players);
        const playerCount: number = players.length;

        return all.filter(
            (tile: Tile, index: int) =>
                tile.state === TileState.Drawn &&
                index % playerCount === me.orderIndex,
        );
    }

    public getPlaced(): Nullable<Tile[]> {
        if (!this.list) {
            return null;
        }
        return this.list.filter(
            (tile: Tile) => tile.state === TileState.Placed,
        );
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
            this.processStates(dtos, session);
            this.onSync.emit();
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

    private processStates(dtos: TileDTO[], session: SessionDTO) {
        const initialAmount: int = this.getInitialAmount();
        assert(this.list);
        for (let i: int = 0; i < this.list.length; i++) {
            const tile: Tile = this.list[i];
            const dto: Nullable<TileDTO> =
                dtos.find((dto: TileDTO) => dto.id === tile.id) || null;

            const state: TileState = this.determineState(
                dto,
                session.turnIndex,
                i,
                initialAmount,
            );
            tile.apply(state, dto);
        }
    }

    private getInitialAmount(): int {
        const players: Nullable<PlayerDTO[]> = GeneralManager.getPlayers();
        assert(players);
        const playerCount: number = players.length;
        let amountPerPlayer: int = 4;

        if (playerCount <= 7) {
            amountPerPlayer = 5;
        }
        if (playerCount <= 5) {
            amountPerPlayer = 6;
        }
        return amountPerPlayer * playerCount;
    }

    private determineState(
        dto: Nullable<TileDTO>,
        turnIndex: Nullable<int>,
        index: int,
        initialAmount: int,
    ): TileState {
        if (dto !== null) {
            return TileState.Placed;
        }
        if (turnIndex === null) {
            return TileState.Unused;
        }
        if (index < turnIndex + initialAmount) {
            return TileState.Drawn;
        }
        return TileState.Unused;
    }
}

export default new TileManager();
