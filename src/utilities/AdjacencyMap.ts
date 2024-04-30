import { Tile } from "entities/Tile";
import { int, Nullable } from "definitions/utils";
import { assert } from "./utils";
import { PlaceTile } from "definitions/placeTile";
import { adjacencyCell } from "../definitions/adjacencyCell";
import PlaceManager from "managers/AdjacencyManager";

export class AdjacencyMap {
    private cells: Map<string, adjacencyCell>;

    public constructor(tiles: Tile[]) {
        this.cells = new Map();
        this.populateMap(tiles);
    }

    public isAdjacent(x: int, y: int): boolean {
        const k: string = this.key(x, y);
        const cellAtK: Nullable<adjacencyCell> = this.cells.get(k) ?? null;
        if (cellAtK === null || cellAtK.orientation === null) {
            return false;
        }
        return true;
    }

    public isAligned(x: int, y: int, tile: PlaceTile): boolean {
        const k: string = this.key(x, y);
        let amountOfConnections: int = 0;
        let isAligned: boolean = true;
        assert(tile.type !== null);
        let connectionsType: Nullable<int[]> =
            PlaceManager.getConnectionsMap().get(tile.type) ?? null;
        assert(connectionsType);
        const connectionsTile: int[] = this.shiftByRotation(
            connectionsType,
            tile.rotation,
        );
        const cellAtK: Nullable<adjacencyCell> = this.cells.get(k) ?? null;
        assert(cellAtK);
        const connectionsRequired: Nullable<int[]> = cellAtK.orientation;
        assert(connectionsRequired);
        for (let i: int = 0; i < 4; i++) {
            if (connectionsRequired[i] === 2) {
                continue;
            }
            if (!(connectionsRequired[i] === connectionsTile[i])) {
                isAligned = false;
            }
            if (connectionsRequired[i] === connectionsTile[i]) {
                amountOfConnections = amountOfConnections + connectionsTile[i];
            }
        }
        if (amountOfConnections < 1) {
            isAligned = false;
        }
        if (connectionsRequired[4] === 0) {
            isAligned = false;
        }
        return isAligned;
    }

    private populateMap(tiles: Tile[]): void {
        const nrTiles: int = tiles.length;
        const connectionsMap: Nullable<Map<int, int[]>> =
            PlaceManager.getConnectionsMap();
        assert(connectionsMap);
        for (let i: int = 0; i < nrTiles; i++) {
            const preConnecitons: Nullable<int[]> =
                connectionsMap.get(tiles[i].type) ?? null;
            assert(preConnecitons);
            const connections: int[] = this.shiftByRotation(
                preConnecitons,
                tiles[i].rotation,
            );
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

    private updateCell(
        x: int,
        y: int,
        locationRelativeToTile: int,
        connectionsOfTile: int[],
    ): void {
        let newCell: adjacencyCell = {
            orientation: null,
        };
        const k: string = this.key(x, y);
        const cellAtK: Nullable<adjacencyCell> = this.cells.get(k) ?? null;
        if (locationRelativeToTile === -1) {
            this.cells.set(k, newCell);
            return;
        }
        if (cellAtK === null) {
            newCell.orientation = this.initialiseConnection(
                locationRelativeToTile,
                connectionsOfTile,
            );
            this.cells.set(k, newCell);
        } else if (cellAtK.orientation !== null) {
            cellAtK.orientation[(locationRelativeToTile + 2) % 4] =
                connectionsOfTile[locationRelativeToTile];
            if (cellAtK.orientation[4] !== 1) {
                cellAtK.orientation[4] = connectionsOfTile[4];
            }
        }
    }

    private initialiseConnection(
        otherTile: int,
        connectionsOfTile: int[],
    ): int[] {
        let connections: int[] = [];
        for (let i: int = 0; i < 5; i++) {
            connections.push(2);
        }
        connections[(otherTile + 2) % 4] = connectionsOfTile[otherTile];
        connections[4] = connectionsOfTile[4];
        return connections;
    }

    private shiftByRotation(connections: int[], rotation: int): int[] {
        assert(connections);
        rotation = ((rotation % 4) + 4) % 4;
        let shiftedConnections: int[] = connections.slice();
        const lastElement: Nullable<int> = shiftedConnections.pop() ?? null;
        assert(lastElement !== null);
        for (let i: int = 0; i < rotation; i++) {
            var elementToShift: Nullable<int> =
                shiftedConnections.pop() ?? null;
            assert(elementToShift !== null);
            shiftedConnections.unshift(elementToShift);
        }
        shiftedConnections.push(lastElement);
        return shiftedConnections;
    }
}
