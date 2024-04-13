import { UUID } from "./utils";

export type JoinDTO = {
    sessionId: UUID;
    playerName: string;
};

export type UpdatePlayerNameDTO = {
    playerId: UUID;
    playerName: string;
};
