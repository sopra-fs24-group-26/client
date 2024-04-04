import { int } from "../definitions/utils";

export type PlayerDTO = {
    username: string;
    playerId: string;
    sessionId: string;
    role: int;
    orderIndex: int;
};
