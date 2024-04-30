import { int, Nullable } from "../definitions/utils";
import { AdjacencyMap } from "../utilities/AdjacencyMap";
import tileConfigs from "../configs/tiles.json";
import { PlaceTile } from "../definitions/placeTile";
import { SessionDTO } from "../definitions/dto";
import SessionManager from "./SessionManager";
import { assert } from "../utilities/utils";
import { api } from "../utilities/api";
import TileManager from "./TileManager";

class AdjacencyManager {
    private adjacencyMap: Nullable<AdjacencyMap>;
    private connectionsMap: Map<int, int[]>;

    public constructor() {
        this.adjacencyMap = null;
        this.connectionsMap = this.createConnectionsMap();
    }

    public getConnectionsMap(): Map<int, int[]> {
        return this.connectionsMap;
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
        this.adjacencyMap = new AdjacencyMap(TileManager.getAllInWorld());
    }

    private createConnectionsMap(): Map<int, int[]> {
        const connectionsMap: Map<int, int[]> = new Map();
        for (const config of tileConfigs) {
            connectionsMap.set(config.type, config.connections);
        }
        return connectionsMap;
    }
}

export default new AdjacencyManager();
