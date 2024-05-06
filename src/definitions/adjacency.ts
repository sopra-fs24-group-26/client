import { int, Nullable, UUID } from "./utils";

export type Placeable = {
    id: Nullable<UUID>;
    type: Nullable<int>;
    sessionId: Nullable<UUID>;
    rotation: int;
    coordinateX: Nullable<int>;
    coordinateY: Nullable<int>;
};

export type Path = {
    top: int;
    right: int;
    bottom: int;
    left: int;
    center: int;
    connectionToStart: int;
    occupied: Nullable<int>;
};
