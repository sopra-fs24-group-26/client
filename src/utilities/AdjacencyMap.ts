import { Tile } from "entities/Tile";
import { int, Nullable } from "definitions/utils";
import { assert } from "./utils";
import { Placeable, Path } from "definitions/adjacency";
import AdjacencyManager from "managers/AdjacencyManager";
import SessionManager from "../managers/SessionManager";
import Phaser from "phaser";
import TileManager from "../managers/TileManager";

export class AdjacencyMap {
    private cells: Map<string, Path>;
    private goldKey: Phaser.Math.Vector2;
    private coalKeys: Phaser.Math.Vector2[] = [];

    public constructor(placedTiles: Tile[]) {
        this.cells = new Map();
        this.goldKey = new Phaser.Math.Vector2(0, 0);
        this.coalKeys = [];
        this.populateMap(placedTiles);
    }

    public isAdjacent(x: int, y: int): boolean {
        const k: string = this.key(x, y);
        const cellAtK: Nullable<Path> = this.cells.get(k) ?? null;
        if (cellAtK === null || cellAtK.occupied === 1) {
            return false;
        }
        return true;
    }

    public isAligned(x: int, y: int, tile: Placeable): boolean {
        const k: string = this.key(x, y);
        assert(tile.type !== null);
        let pathType: Nullable<Path> =
            AdjacencyManager.getPathMap().get(tile.type) ?? null;
        assert(pathType);
        const pathTile: Path = this.shiftByRotation(pathType, tile.rotation);
        const pathRequired: Nullable<Path> = this.cells.get(k) ?? null;
        assert(pathRequired);
        if (pathRequired.connectionToStart === 0) {
            return false;
        }
        return (
            this.checkDirections("top", pathRequired, pathTile) &&
            this.checkDirections("right", pathRequired, pathTile) &&
            this.checkDirections("bottom", pathRequired, pathTile) &&
            this.checkDirections("left", pathRequired, pathTile)
        );
    }

    private checkDirections(
        key: keyof Path,
        pathRequired: Path,
        pathTile: Path,
    ): boolean {
        if (pathRequired[key] === 2) {
            return true;
        }
        if (pathRequired[key] === pathTile[key]) {
            return true;
        }
        return false;
    }

    private populateMap(tiles: Tile[]): void {
        const nrTiles: int = tiles.length;
        for (let i: int = 0; i < nrTiles; i++) {
            const pathType: Nullable<Path> =
                AdjacencyManager.getPathMap().get(tiles[i].type) ?? null;
            assert(pathType);
            const pathTile: Path = this.shiftByRotation(
                pathType,
                tiles[i].rotation,
            );
            const x: Nullable<int> = tiles[i].coordinateX;
            const y: Nullable<int> = tiles[i].coordinateY;
            assert(x !== null);
            assert(y !== null);
            this.updateCellAndAdjacent(x, y, pathTile);
            if (tiles[i].type === 9) {
                this.goldKey.set(x, y);
            }
            if (tiles[i].type === 10) {
                this.coalKeys.push(new Phaser.Math.Vector2(x, y));
            }
        }
        this.updateConnectionToStart(0, 0);
    }

    private updateCellAndAdjacent(x: int, y: int, pathTile: Path): void {
        this.updateCell(x, y, null, pathTile);
        this.updateCell(x, y - 1, "top", pathTile);
        this.updateCell(x + 1, y, "right", pathTile);
        this.updateCell(x, y + 1, "bottom", pathTile);
        this.updateCell(x - 1, y, "left", pathTile);
    }

    private key(x: int, y: int): string {
        return x + "." + y;
    }

    private updateCell(
        x: int,
        y: int,
        locationRelativeToAdjacent: Nullable<keyof Path>,
        pathAdjacentTile: Path,
    ): void {
        const k: string = this.key(x, y);
        const cellAtK: Nullable<Path> = this.cells.get(k) ?? null;
        if (locationRelativeToAdjacent === null) {
            pathAdjacentTile.occupied = 1;
            this.cells.set(k, pathAdjacentTile);
            return;
        }
        if (cellAtK === null) {
            let newCell: Path = this.initializeRequiredPath(
                locationRelativeToAdjacent,
                pathAdjacentTile,
            );
            this.cells.set(k, newCell);
        } else {
            let updatedCell: Path = this.updateRequiredPath(
                cellAtK,
                locationRelativeToAdjacent,
                pathAdjacentTile,
            );
            this.cells.set(k, updatedCell);
        }
    }

    private initializeRequiredPath(
        locationRelativeToAdjacent: keyof Path,
        pathAdjacentCell: Path,
    ): Path {
        const locationFromThisCell: keyof Path = this.reverseDirection(
            locationRelativeToAdjacent,
        );
        let newCell: Path = {
            top: 2,
            right: 2,
            bottom: 2,
            left: 2,
            center: 2,
            connectionToStart: 0,
            occupied: 0,
        } as Path;
        // @ts-ignore
        newCell[locationFromThisCell] =
            pathAdjacentCell[locationRelativeToAdjacent];
        return newCell;
    }

    private updateRequiredPath(
        cellAtK: Path,
        locationRelativeToAdjacent: keyof Path,
        pathAdjacentCell: Path,
    ): Path {
        const locationFromToThisCell: keyof Path = this.reverseDirection(
            locationRelativeToAdjacent,
        );
        // @ts-ignore
        cellAtK[locationFromToThisCell] =
            pathAdjacentCell[locationRelativeToAdjacent];
        return cellAtK;
    }

    private reverseDirection(attribute: keyof Path): keyof Path {
        if (attribute === "top") {
            return "bottom";
        }
        if (attribute === "bottom") {
            return "top";
        }
        if (attribute === "left") {
            return "right";
        }
        return "left";
    }

    private shiftByRotation(connections: Path, rotation: int): Path {
        let newConnections: Path = { ...connections };
        rotation = ((rotation % 4) + 4) % 4;
        for (let i: int = 0; i < rotation; i++) {
            let temp: int = newConnections.top;
            newConnections.top = newConnections.left;
            newConnections.left = newConnections.bottom;
            newConnections.bottom = newConnections.right;
            newConnections.right = temp;
        }
        return newConnections;
    }

    private updateConnectionToStart(x: int, y: int): void {
        const k: string = this.key(x, y);
        let path: Nullable<Path> = this.cells.get(k) ?? null;
        assert(path);
        if (path.connectionToStart) {
            return;
        }
        if (this.goldKey.x === x && this.goldKey.y === y) {
            SessionManager.setReachedGold();
        }
        if (
            this.coalKeys.some(
                (coordinate) => coordinate.x === x && coordinate.y === y,
            ) &&
            !TileManager.reachedCoal.some(
                (coordniate) => coordniate.x === x && coordniate.y === y,
            )
        ) {
            TileManager.reachedCoal.push(new Phaser.Math.Vector2(x, y));
        }
        path.connectionToStart = 1;
        this.cells.set(k, path);
        if (!path.occupied || !path.center) {
            return;
        }
        if (path.top) {
            this.updateConnectionToStart(x, y - 1);
        }
        if (path.right) {
            this.updateConnectionToStart(x + 1, y);
        }
        if (path.bottom) {
            this.updateConnectionToStart(x, y + 1);
        }
        if (path.left) {
            this.updateConnectionToStart(x - 1, y);
        }
    }
}
