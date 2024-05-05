import { int, Nullable } from "../definitions/utils";
import { AdjacencyMap } from "../utilities/AdjacencyMap";
import tileConfigs from "../configs/tiles.json";
import { Placeable, Path } from "../definitions/placeable";
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
        this.adjacencyMap = new AdjacencyMap(
            TileManager.getAllExceptVeins(),
            TileManager.getVeins(),
        );
    }

    private createConnectionsMap(): Map<int, Path> {
        const connectionsMap: Map<int, Path> = new Map();
        for (const config of tileConfigs) {
            connectionsMap.set(config.type, {
                top: config.connections[0],
                right: config.connections[1],
                bottom: config.connections[2],
                left: config.connections[3],
                center: config.connections[4],
                connectionToStart: 2,
                occupied: null,
            } as Path);
        }

        return connectionsMap;
    }
}

export default new AdjacencyManager();
