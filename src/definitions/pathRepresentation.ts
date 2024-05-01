import { int, Nullable } from "./utils";

export type pathRepresentation = {
    top: int;
    right: int;
    bottom: int;
    left: int;
    center: int;
    connectionToStart: int;
    occupied: Nullable<int>;
};
