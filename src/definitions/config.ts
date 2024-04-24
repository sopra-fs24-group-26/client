import { int } from "./utils";

export type TileConfig = {
    type: int;
    amount: int;
};

export type TileConnectionConfig = {
    type: int;
    connections: int[];
}
