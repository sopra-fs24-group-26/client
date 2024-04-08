import { int, Nullable, UUID } from "../definitions/utils";
import { PlayerInformation } from "definitions/information";
import GeneralManager from "./GeneralManager";

class PlayerManager {
    public saveId(id: UUID): void {
        localStorage.setItem("playerId", id);
    }

    public removeId(): void {
        localStorage.removeItem("playerId");
    }

    public getId(): Nullable<UUID> {
        return localStorage.getItem("playerId") || null;
    }

    public getAll(): Nullable<PlayerInformation[]> {
        return GeneralManager.getPlayers();
    }

    public getMe(): Nullable<PlayerInformation> {
        const players: Nullable<PlayerInformation[]> = this.getAll();
        if (!players) {
            return null;
        }
        return (
            players.filter(
                (player: PlayerInformation) => player.id === this.getId(),
            )[0] || null
        );
    }

    /** return:
     * null if players is null
     * empty array if no other players exist
     * normal array if other players exist
     */
    public getOthers(): Nullable<PlayerInformation[]> {
        const players: Nullable<PlayerInformation[]> = this.getAll();
        if (!players) {
            return null;
        }
        return players.filter(
            (player: PlayerInformation) => player.id !== this.getId(),
        );
    }

    public generateName(): string {
        const prefix: string[] = [
            "Sir ",
            "Dr. ",
            "Madam ",
            "My ",
            "General ",
            "Crazy ",
            "Blue ",
            "Lady ",
        ];
        const title: string[] = [
            "Lord ",
            "med. ",
            "Knight ",
            "Horny ",
            "Ugly ",
            "King ",
            "Queen ",
        ];
        const names: string[] = [
            "Nightingale",
            "Einstein",
            "of Rivia",
            "Lancelot",
            "Targaryen",
            "Karen",
            "Poopybutthole",
            "of the Migros",
        ];
        const maxPrefix: int = prefix.length;
        const maxTitle: int = title.length;
        const maxName: int = names.length;

        const randomPrefix: int = Math.floor(Math.random() * maxPrefix);
        const randomTitle: int = Math.floor(Math.random() * maxTitle);
        const randomName: int = Math.floor(Math.random() * maxName);

        const username: string =
            prefix[randomPrefix] + title[randomTitle] + names[randomName];

        return username;
    }
}

export default new PlayerManager();
