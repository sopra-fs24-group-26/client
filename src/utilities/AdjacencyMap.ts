import { Tile } from "entities/Tile";
import { int, Nullable } from "definitions/utils";
import TileManager from "../managers/TileManager";
import { assert } from "./utils";
import { PlaceTile } from "definitions/placeTile";

export class AdjacencyMap {
    private cells: Map<string, [boolean, Nullable<int[]>]>;

    public constructor(tiles: Tile[]) {
        this.cells = new Map();
        this.populateMap(tiles);
    }

    public isAdjacent(x: int, y: int): boolean {
        const isAdjacent: Nullable<[boolean, Nullable<int[]>]> = this.cells.get(this.key(x, y)) ?? null;
        if (isAdjacent !== null) {
            return isAdjacent[0];
        }
        return false;
    }

    public isAligned(x: int, y: int, tile: PlaceTile): boolean {
        const k: string = this.key(x, y);
        var amountOfConnections: int = 0;
        var isAligned: boolean = true;
        assert(tile.type !== null);
        const connectionsType: Nullable<int[]> = TileManager.getConnectionsMap().get(tile.type) ?? null;
        assert(connectionsType);
        const connectionsTile: int[] = this.shiftByRotation(connectionsType.slice(), tile.rotation);
        const cellAtK: Nullable<[boolean, Nullable<int[]>]> = this.cells.get(k) ?? null;
        assert(cellAtK);
        const connectionsRequired: Nullable<int[]> = cellAtK[1];
        assert(connectionsRequired);
        for (let i: int = 0; i < 4; i++) {
            if (connectionsRequired[i] === 2) {continue;}
            if (!(connectionsRequired[i] === connectionsTile[i])) {isAligned = false;}
            if (connectionsRequired[i] === connectionsTile[i]) {amountOfConnections = amountOfConnections + connectionsTile[i];}
        }
        if (amountOfConnections < 1) isAligned = false;
        if (connectionsRequired[4] === 0) isAligned = false;
        return isAligned;
    }

    private populateMap(tiles: Tile[]): void {
        const nrTiles: int = tiles.length;
        const connectionsMap: Nullable<Map<int, int[]>> = TileManager.getConnectionsMap();
        assert(connectionsMap);
        for (let i: int = 0; i < nrTiles; i++) {
            const preConnecitons: Nullable<int[]> = connectionsMap.get(tiles[i].type) ?? null;
            assert(preConnecitons);
            const connections: int[] = this.shiftByRotation(preConnecitons, tiles[i].rotation);
            const x: Nullable<int> = tiles[i].coordinateX;
            const y: Nullable<int> = tiles[i].coordinateY;
            assert(x !== null);
            assert(y !== null);
            this.updateCell(x, y, -1, connections);
            this.updateCell(x, y - 1, 0, connections);
            this.updateCell(x + 1, y, 1, connections);
            this.updateCell(x, y + 1, 2, connections);
            this.updateCell(x - 1, y, 3, connections);
        }
    }

    private key(x: int, y: int): string {
        return x + "." + y;
    }

    private updateCell(x: int, y: int, locationRelativeToTile: int, connectionsOfTile: int[]): void {
        const k: string = this.key(x, y);
        if (locationRelativeToTile === -1) {
            this.cells.set(k, [false, null]);
            return;
        }
        const cellAtK: Nullable<[boolean, Nullable<int[]>]> = this.cells.get(k) ?? null;
        if (cellAtK === null) {
            const connections: int[] = this.initialiseConnection(locationRelativeToTile, connectionsOfTile);
            this.cells.set(k, [true, connections]);
        } else if (cellAtK[0]) {
            const connections: Nullable<int[]> = cellAtK[1];
            assert(connections);
            connections[(locationRelativeToTile + 2) % 4] = connectionsOfTile[locationRelativeToTile];
            if (connections[4] !== 1) {
                connections[4] = connectionsOfTile[4];
            }
        }
    }

    private initialiseConnection(otherTile: int, connectionsOfTile: int[]): int[] {
        var connections: int[] = [];
        for (let i: int = 0; i < 5; i++) {
            connections.push(2);
        }
        connections[(otherTile + 2) % 4] = connectionsOfTile[otherTile];
        connections[4] = connectionsOfTile[4];
        return connections;
    }

    private shiftByRotation(connections: int[], rotation: int): int[] {
        assert(connections);
        rotation = (rotation % 4 + 4) % 4;
        var shiftedConnections: int[] = connections.slice();
        const lastElement: Nullable<int> = shiftedConnections.pop() ?? null;
        assert(lastElement);
        for (let i: int = 0; i < rotation; i++) {
            var elementToShift: Nullable<int> = shiftedConnections.pop() ?? null;
            assert(elementToShift);
            shiftedConnections.unshift(elementToShift);
        }
        shiftedConnections.push(lastElement);
        return shiftedConnections;
    }
}