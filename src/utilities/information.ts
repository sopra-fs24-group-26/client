import { int, UUID, Nullable } from "definitions/utils";
import {
    PlayerInformation,
    TileInformation,
    SessionInformation,
} from "definitions/information";

export function playersEqual(
    player1: Nullable<PlayerInformation>,
    player2: Nullable<PlayerInformation>,
): boolean {
    return JSON.stringify(player1) === JSON.stringify(player2);
}

export function playersNotEqual(
    player1: Nullable<PlayerInformation>,
    player2: Nullable<PlayerInformation>,
): boolean {
    return JSON.stringify(player1) !== JSON.stringify(player2);
}

export function sessionsEqual(
    session1: Nullable<SessionInformation>,
    session2: Nullable<SessionInformation>,
): boolean {
    return JSON.stringify(session1) === JSON.stringify(session2);
}

export function sessionsNotEqual(
    session1: Nullable<SessionInformation>,
    session2: Nullable<SessionInformation>,
): boolean {
    return JSON.stringify(session1) !== JSON.stringify(session2);
}

export function tilesEqual(
    tile1: Nullable<TileInformation>,
    tile2: Nullable<TileInformation>,
): boolean {
    return JSON.stringify(tile1) === JSON.stringify(tile2);
}

export function tilesNotEqual(
    tile1: Nullable<TileInformation>,
    tile2: Nullable<TileInformation>,
): boolean {
    return JSON.stringify(tile1) !== JSON.stringify(tile2);
}
