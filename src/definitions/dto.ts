import { Nullable, UUID, int } from "./utils";

export type DataDTO = {
    session: SessionDTO;
    players: PlayerDTO[];
    tiles: TileDTO[];
};

export type SessionDTO = {
    id: UUID;
    seed: string;
    turnIndex: Nullable<int>;
};

export type PlayerDTO = {
    id: UUID;
    name: string;
    orderIndex: Nullable<int>;
};

export type TileDTO = {
    id: UUID;
    rotation: Nullable<int>;
    coordinateX: Nullable<int>;
    coordinateY: Nullable<int>;
};

export type JoinDTO = {
    sessionId: UUID;
    playerName: string;
};
