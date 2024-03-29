import { int, UUID, Nullable } from "definitions/utils";

export type DataInformation = {
    player: PlayerInformation;
    session: SessionInformation;
    players: Array<PlayerInformation>;
    tiles: Array<TileInformation>;
};

export type PlayerInformation = {
    id: UUID; //playerID
    name: string; //playername
    sessionId: UUID;
    role: Nullable<int>;
    orderIndex: Nullable<int>;
};

export type SessionInformation = {
    sessionId: UUID; //empty is default
    turnPlayer: Nullable<UUID>; // the player who is at turn
    playerCount: int; // number of players in session
};

export type TileInformation = {
    id: UUID; //tileID
    sessionID: UUID; //to which session the tile belongs to
    type: int; //the type of tile, represents the kind of path
    isPlaced: boolean; //whether the tile is placed in game frame
    rotation: Nullable<int>; //how to turn the tile before placing
    coordinateX: Nullable<int>; //x-coordinate of tile in game
    coordinateY: Nullable<int>; //y-coordinate of tile in game
};
