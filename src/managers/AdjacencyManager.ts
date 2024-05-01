import { int, Nullable } from "../definitions/utils";
import { AdjacencyMap } from "../utilities/AdjacencyMap";
import tileConfigs from "../configs/tiles.json";
import { PlaceTile } from "../definitions/placeTile";
import { SessionDTO } from "../definitions/dto";
import SessionManager from "./SessionManager";
import { assert } from "../utilities/utils";
import { api } from "../utilities/api";
import TileManager from "./TileManager";
import { pathRepresentation } from "../definitions/pathRepresentation";

class AdjacencyManager {
    private adjacencyMap: Nullable<AdjacencyMap>;
    private pathMap: Map<int, pathRepresentation>;
    private hasWon: boolean;

    public constructor() {
        this.adjacencyMap = null;
        this.pathMap = this.createConnectionsMap();
        this.hasWon = false;
    }

    public setHasWon(hasWon: boolean): void {
        this.hasWon = hasWon;
    }

    public getHasWon(): boolean {
        return this.hasWon;
    }
    public getPathMap(): Map<int, pathRepresentation> {
        return this.pathMap;
    }

    public tile(tile: PlaceTile): void {
        const session: Nullable<SessionDTO> = SessionManager.get();
        assert(session);
        tile.sessionId = session.id;
        api.put("/placeTile", tile);
    }

    public checkAdjacency(x: int, y: int): boolean {
        assert(this.adjacencyMap);
        return this.adjacencyMap.isAdjacent(x, y);
    }

    public checkConnections(x: int, y: int, tile: PlaceTile): boolean {
        assert(this.adjacencyMap);
        return this.adjacencyMap.isAligned(x, y, tile);
    }

    public createAdjacencyMap(): void {
        this.adjacencyMap = new AdjacencyMap(
            TileManager.getAllExceptGoal(),
            TileManager.getVeins(),
        );
    }

    private createConnectionsMap(): Map<int, pathRepresentation> {
        const connectionsMap: Map<int, pathRepresentation> = new Map();
        for (const config of tileConfigs) {
            connectionsMap.set(config.type, {
                top: config.connections[0],
                right: config.connections[1],
                bottom: config.connections[2],
                left: config.connections[3],
                center: config.connections[4],
                connectionToStart: 2,
                occupied: null,
            });
        }

        return connectionsMap;
    }
}

export default new AdjacencyManager();
