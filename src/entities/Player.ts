import { PlayerDTO } from "definitions/dto";
import { Role } from "definitions/enums";
import { UUID, Nullable, int } from "definitions/utils";
import { seededShuffle } from "utilities/utils";

export class Player {
    public readonly id: UUID;
    public readonly name: string;
    public readonly orderIndex: Nullable<int>;
    public readonly role: Nullable<Role>;
    public readonly profile: Nullable<int>;

    public constructor(dto: PlayerDTO, playerCount: int, seed: string) {
        this.id = dto.id;
        this.name = dto.name;
        this.orderIndex = dto.orderIndex;
        this.role = this.getRole(playerCount, this.orderIndex, seed);
        this.profile = this.getProfile(playerCount, this.orderIndex, seed);
    }

    private getProfile(
        playerCount: int,
        index: Nullable<int>,
        seed: string,
    ): Nullable<int> {
        if (index === null) {
            return null;
        }
        const profiles: int[] = this.generateProfiles(playerCount);
        return seededShuffle(profiles, seed)[index];
    }

    private generateProfiles(playerCount: int): int[] {
        const nrOfProfiles: int = 4;
        let counter: int = 0;
        let profiles: int[] = [];
        while (profiles.length !== playerCount) {
            if (counter === nrOfProfiles - 1) {
                counter = 0;
            }
            profiles.push(counter);
            counter++;
        }
        return profiles;
    }

    private getRole(
        playerCount: int,
        index: Nullable<int>,
        seed: string,
    ): Nullable<Role> {
        if (index === null) {
            return null;
        }
        const roles: Role[] = this.generateRoles(playerCount);
        return seededShuffle(roles, seed)[index];
    }

    private generateRoles(playerCount: int): Role[] {
        const roles: Role[] = [];
        let saboteurs: int = 0;
        if (playerCount <= 4) {
            saboteurs = 1;
        } else if (playerCount <= 6) {
            saboteurs = 2;
        } else if (playerCount <= 9) {
            saboteurs = 3;
        } else {
            saboteurs = 4;
        }
        while (roles.length !== playerCount) {
            if (saboteurs-- > 0) {
                roles.push(Role.Saboteur);
                continue;
            }
            roles.push(Role.Miner);
        }
        return roles;
    }
}
