import { int, UUID, Nullable } from "definitions/utils";

export type DataInformation = {
    session: SessionInformation;
    players: PlayerInformation[];
    tiles: TileInformation[];
};

export type PlayerInformation = {
    id: UUID;
    name: string;
    sessionId: UUID;
    role: Nullable<int>;
    orderIndex: Nullable<int>;
};

export type SessionInformation = {
    id: UUID;
    playerCount: int; // number of players in session
    turnPlayer: Nullable<UUID>; // the player who is at turn
};

export type TileInformation = {
    id: UUID;
    sessionID: UUID;
    type: int; //the type of tile, represents the kind of path
    isPlaced: boolean; //whether the tile is placed in game frame
    rotation: Nullable<int>; //how to turn the tile before placing
    coordinateX: Nullable<int>; //x-coordinate of tile in game
    coordinateY: Nullable<int>; //y-coordinate of tile in game
};
