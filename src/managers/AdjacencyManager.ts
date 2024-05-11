import { int, Nullable } from "../definitions/utils";
import { AdjacencyMap } from "../utilities/AdjacencyMap";
import tileConfigs from "../configs/tiles.json";
import { Placeable, Path } from "../definitions/adjacency";
import { assert } from "../utilities/utils";
import TileManager from "./TileManager";

class AdjacencyManager {
    private adjacencyMap: Nullable<AdjacencyMap>;
    private pathMap: Map<int, Path>;

    public constructor() {
        this.adjacencyMap = null;
        this.pathMap = this.createConnectionsMap();
    }

    public getPathMap(): Map<int, Path> {
        return this.pathMap;
    }

    public checkAdjacency(x: int, y: int): boolean {
        assert(this.adjacencyMap);
        return this.adjacencyMap.isAdjacent(x, y);
    }

    public checkConnections(x: int, y: int, tile: Placeable): boolean {
        assert(this.adjacencyMap);
        return this.adjacencyMap.isAligned(x, y, tile);
    }

    public createAdjacencyMap(): void {
        this.adjacencyMap = new AdjacencyMap(TileManager.getAllInWorld());
    }

    private createConnectionsMap(): Map<int, Path> {
        const connectionsMap: Map<int, Path> = new Map();
        for (const config of tileConfigs) {
            connectionsMap.set(
                config.type,
                this.createPath(config.connections),
            );
        }
        return connectionsMap;
    }

    private createPath(connections: int[]): Path {
        return {
            top: connections[0],
            right: connections[1],
            bottom: connections[2],
            left: connections[3],
            center: connections[4],
            connectionToStart: 0,
            occupied: null,
        } as Path;
    }
}

export default new AdjacencyManager();
