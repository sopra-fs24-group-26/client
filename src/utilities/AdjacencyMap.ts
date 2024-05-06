import { Tile } from "entities/Tile";
import { int, Nullable } from "definitions/utils";
import { assert } from "./utils";
import { Placeable, Path } from "definitions/adjacency";
import AdjacencyManager from "managers/AdjacencyManager";

export class AdjacencyMap {
    private cells: Map<string, Path>;

    public constructor(allPlacedTilesExceptGoal: Tile[], goalTiles: Tile[]) {
        this.cells = new Map();
        this.populateMap(allPlacedTilesExceptGoal, goalTiles);
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

    private populateMap(tiles: Tile[], goalTiles: Tile[]): void {
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
        }
        this.updateGoalTiles(goalTiles);
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
            connectionToStart: 1,
            occupied: 0,
        } as Path;
        // @ts-ignore
        newCell[locationFromThisCell] =
            pathAdjacentCell[locationRelativeToAdjacent];
        if (
            pathAdjacentCell.center === 0 ||
            pathAdjacentCell.connectionToStart === 0 ||
            pathAdjacentCell[locationRelativeToAdjacent] === 0
        ) {
            newCell.connectionToStart = 0;
        }
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
        if (
            cellAtK.connectionToStart !== 1 &&
            pathAdjacentCell[locationRelativeToAdjacent] === 1
        ) {
            cellAtK.connectionToStart = Math.min(
                pathAdjacentCell.connectionToStart,
                pathAdjacentCell.center,
            );
        }

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

    private updateGoalTiles(goalTiles: Tile[]): void {
        const nrTiles: int = goalTiles.length;
        for (let i: int = 0; i < nrTiles; i++) {
            const x: Nullable<int> = goalTiles[i].coordinateX;
            const y: Nullable<int> = goalTiles[i].coordinateY;
            assert(x !== null);
            assert(y !== null);
            let goalPathRepresentation: Nullable<Path> =
                AdjacencyManager.getPathMap().get(goalTiles[i].type) ?? null;
            assert(goalPathRepresentation);
            if (
                (this.cells.get(this.key(x, y - 1))?.occupied === 1 &&
                    this.cells.get(this.key(x, y - 1))?.center === 1) ||
                (this.cells.get(this.key(x + 1, y))?.occupied === 1 &&
                    this.cells.get(this.key(x + 1, y))?.center === 1) ||
                (this.cells.get(this.key(x, y + 1))?.occupied === 1 &&
                    this.cells.get(this.key(x, y + 1))?.center === 1) ||
                (this.cells.get(this.key(x - 1, y))?.occupied === 1 &&
                    this.cells.get(this.key(x - 1, y))?.center === 1)
            ) {
                goalPathRepresentation.connectionToStart = 1;
                if (goalTiles[i].type === 9) {
                    AdjacencyManager.setHasWon(true);
                }
            } else {
                goalPathRepresentation.connectionToStart = 0;
            }
            this.updateCellAndAdjacent(x, y, goalPathRepresentation);
        }
    }
}
