import { Nullable, int } from "definitions/utils";
import GeneralManager from "./GeneralManager";
import tileConfigs from "configs/tiles.json";
import { PlaceTile } from "definitions/placeTile";
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
import { api } from "../utilities/api";
import SessionManager from "./SessionManager";
import { AdjacencyMap } from "utilities/AdjacencyMap";

class TileManager {
    public readonly onSync: EventEmitter;
    private list: Nullable<Tile[]>;
    private adjacencyMap: Nullable<AdjacencyMap>;
    private connectionsMap: Map<int, int[]>;

    public constructor() {
        this.onSync = new EventEmitter();
        this.list = null;
        this.adjacencyMap = null;
        this.connectionsMap = this.createConnectionsMap();
    }

    public getConnectionsMap(): Map<int, int[]> {
        return this.connectionsMap;
    }

    public getAll(): Nullable<Tile[]> {
        return this.list;
    }
    public getAdjacencyMap(): Nullable<AdjacencyMap> {
        return this.adjacencyMap;
    }

    public updateAdjacencyMap(): void {
        this.adjacencyMap = new AdjacencyMap(this.getRelevantInWorld());
    }

    private getRelevantInWorld(): Tile[] {
        const placedTiles: Nullable<Tile[]> = this.getPlaced();
        assert(placedTiles);
        const startingTile: Tile[] = this.getStarting();
        return [...placedTiles, ...startingTile];
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

    private getStarting(): Tile[] {
        return this.getPreplaced().filter(
            (tile: Tile) => tile.coordinateX === 0 && tile.coordinateY === 0,
        );
    }

    public place(tile: PlaceTile): void {
        const session: Nullable<SessionDTO> = SessionManager.get();
        assert(session);
        tile.sessionId = session.id;
        api.put("/placeTile", tile);
    }

    public discard(tile: PlaceTile): void {
        const session: Nullable<SessionDTO> = SessionManager.get();
        assert(session);
        tile.sessionId = session.id;
        api.put("/discardTile", tile);
    }

    public initialize(): void {
        this.listen();
    }

    private createConnectionsMap(): Map<int, int[]> {
        const connectionsMap: Map<int, int[]> = new Map();
        for (const config of tileConfigs) {
            connectionsMap.set(config.type, config.connections);
        }
        return connectionsMap;
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
