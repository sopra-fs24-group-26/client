import { Nullable, int } from "definitions/utils";
import GeneralManager from "./GeneralManager";
import tileConfigs from "configs/tiles.json";
import preplacedTiles from "configs/preplacedTiles.json";
import { TileConfig } from "definitions/config";
import { assert, seededShuffle } from "utilities/utils";
import { PlayerDTO, SessionDTO, TileDTO } from "definitions/dto";
import { Tile } from "entities/Tile";
import seedrandom from "seedrandom";
import { TileState } from "definitions/enums";
import { EventEmitter } from "utilities/EventEmitter";
import PlayerManager from "./PlayerManager";
import { Player } from "entities/Player";
import SessionManager from "./SessionManager";
import { api } from "../utilities/api";
import { Placeable } from "definitions/adjacency";

class TileManager {
    public readonly onSync: EventEmitter;
    public reachedCoal: Phaser.Math.Vector2[] = [];
    private list: Nullable<Tile[]>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.list = null;
    }

    public getAll(): Nullable<Tile[]> {
        return this.list;
    }

    public getAllExceptVeins(): Tile[] {
        const placedTiles: Nullable<Tile[]> = this.getPlaced();
        assert(placedTiles);
        const preplacedTiles: Tile[] = this.getPreplaced();
        const startingTile: Tile[] = preplacedTiles.filter(
            (tile: Tile) => tile.coordinateX === 0,
        );
        return [...startingTile, ...placedTiles];
    }

    public getAllInWorld(): Tile[] {
        const prePlaced: Tile[] = this.getPreplaced();
        const placed: Nullable<Tile[]> = this.getPlaced();
        assert(placed);
        return [...prePlaced, ...placed];
    }

    public getVeins(): Tile[] {
        const preplacedTiles: Tile[] = this.getPreplaced();
        const goalTiles: Tile[] = preplacedTiles.filter(
            (tile: Tile) => tile.coordinateX !== 0,
        );
        return goalTiles;
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

    public getPreplaced(): Tile[] {
        const session: Nullable<SessionDTO> = SessionManager.get();
        assert(session);
        const tiles: Tile[] = [];
        const random: seedrandom.PRNG = seedrandom(session.seed);
        const veins: int[] = seededShuffle([9, 10, 10], session.seed); // 9 is gold, 10 are coal veins

        for (const item of preplacedTiles) {
            // this is to turn coal veins into real coal paths
            if (
                this.reachedCoal.some(
                    (coordinate) =>
                        coordinate.x === item.coordinateX &&
                        coordinate.y === item.coordinateY,
                )
            ) {
                veins[veins.length - 1] = 12;
            }

            const tile: Tile = new Tile(random, item.type || veins.pop()!);
            const tileDTO: TileDTO = {
                id: tile.id,
                rotation: item.rotation,
                coordinateX: item.coordinateX,
                coordinateY: item.coordinateY,
                discarded: false,
            } as TileDTO;

            tile.apply(TileState.Placed, tileDTO);
            tiles.push(tile);
        }
        return tiles;
    }

    public place(tile: Placeable): void {
        const session: Nullable<SessionDTO> = SessionManager.get();
        assert(session);
        tile.sessionId = session.id;
        api.put("/placeTile", tile);
    }

    public discard(tile: Placeable): void {
        const session: Nullable<SessionDTO> = SessionManager.get();
        assert(session);
        tile.sessionId = session.id;
        api.put("/discardTile", tile);
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

    private processStates(dtos: TileDTO[], session: SessionDTO): void {
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
            if (dto.discarded === true) {
                return TileState.Discarded;
            }
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
