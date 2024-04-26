import { Tile } from "entities/Tile";
import { int, Nullable } from "definitions/utils";
import TileManager from "../managers/TileManager";
import { assert } from "./utils";
import { PlaceTile } from "definitions/placeTile";

export class AdjacencyMap {
    private cells: Map<string,[boolean, Nullable<int[]>]>;
    public constructor(tiles: Tile[]) {
        this.cells = new Map();
        this.populateMap(tiles);
    }

    public isAdjacent(x: int,y: int): boolean {
        const isAdjacent : [boolean, Nullable<int[]>] | undefined = this.cells.get(this.key(x,y));
        if( isAdjacent !== undefined){
            return isAdjacent[0];
        }
        return false
    }

    public isAligned(x: int, y: int, tile: PlaceTile): boolean {
        const k: string = this.key(x,y);
        var amountOfConnections: int = 0;
        var isAligned: boolean = true;
        assert(tile.type !== null);
        const connectionsType : int[] | undefined= TileManager.getConnectionsMap().get(tile.type);
        assert(connectionsType);
        const connectionsTile: int[] = this.shiftByRotation(connectionsType.slice(), tile.rotation);
        const connectionsRequired: Nullable<int[]> | undefined = this.cells.get(k)[1]
        assert(connectionsRequired);
        for (let i: int = 0; i < 4; i++) {
            if(connectionsRequired[i] === 2) continue;
            if(!(connectionsRequired[i] === connectionsTile[i])) isAligned = false;
            if(connectionsRequired[i] === connectionsTile[i]) amountOfConnections = amountOfConnections + connectionsTile[i];
        }
        if(amountOfConnections < 1) isAligned = false;
        if(connectionsRequired[4] === 0) isAligned = false;
        return isAligned;
    }

    private populateMap(tiles: Tile[]):void {
        const nrTiles: int = tiles.length;
        for (let i: int = 0; i < nrTiles; i++) {
            const connections: int[] = this.shiftByRotation(TileManager.getConnectionsMap().get(tiles[i].type), tiles[i].rotation);
            const x: Nullable<int> = tiles[i].coordinateX;
            const y: Nullable<int> = tiles[i].coordinateY;
            assert(x !== null);
            assert(y !== null);
            this.updateCell(x, y, -1, connections);
            this.updateCell(x, y-1, 0, connections);
            this.updateCell(x+1, y, 1, connections);
            this.updateCell(x, y+1, 2, connections);
            this.updateCell(x-1, y, 3, connections);
        }
    }

    private key(x: int, y: int): string {
        return x + "." + y;
    }

    private updateCell(x: int, y: int, locationRelativeToTile: int, connectionsOfTile: int[]): void {
        const k: string = this.key(x,y);
        if (locationRelativeToTile === -1) {
            this.cells.set(k, [false, null]);
            return;
        }
        if (!(this.cells.has(k))) {
            const connections: int[] = this.initialiseConnection(locationRelativeToTile, connectionsOfTile);
            this.cells.set(k, [true,connections]);
        } else if (this.cells.get(k)[0]) {
            const connections: Nullable<int> = this.cells.get(k)[1];
            assert(connections !== undefined && connections !== null);
            connections[(locationRelativeToTile+2)%4] = connectionsOfTile[locationRelativeToTile];
            if (connections[4] !== 1) {
                connections[4] = connectionsOfTile[4];
            }
        }
    }

    private initialiseConnection(otherTile: int, connectionsOfTile: int[]): int[]{
        var connections: int[] = [];
        for(let i: int = 0; i < 5; i++) {
            connections.push(2);
        }
        connections[(otherTile+2)%4] = connectionsOfTile[otherTile];
        connections[4] = connectionsOfTile[4];
        return connections;
    }

    private shiftByRotation(connections: int[] | undefined, rotation: int): int[] {
        assert(connections);
        rotation = (rotation%4 + 4)%4;
        var shiftedConnections: number[] = connections.slice();
        const lastElement:  number | undefined = shiftedConnections.pop();
        assert(lastElement !== undefined)
        for (let i: number = 0; i < rotation; i++) {
            var elementToShift: number | undefined= shiftedConnections.pop();
            assert(elementToShift!== undefined)
            shiftedConnections.unshift(elementToShift);
        }
        shiftedConnections.push(lastElement);
        return shiftedConnections;
    }
}