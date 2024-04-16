import { PlayerDTO } from "definitions/dto";
import { Role } from "definitions/enums";
import { UUID, Nullable, int } from "definitions/utils";
import { seededShuffle } from "utilities/utils";

export class Player {
    public readonly id: UUID;
    public readonly name: string;
    public readonly orderIndex: Nullable<int>;
    public readonly role: Nullable<Role>;

    public constructor(dto: PlayerDTO, count: int, seed: string) {
        this.id = dto.id;
        this.name = dto.name;
        this.orderIndex = dto.orderIndex;
        this.role = this.getRole(count, this.orderIndex, seed);
    }

    private getRole(
        count: int,
        index: Nullable<int>,
        seed: string,
    ): Nullable<Role> {
        if (index === null) {
            return null;
        }
        const roles: Role[] = this.generateRoles(count);
        return seededShuffle(roles, seed)[index];
    }

    private generateRoles(count: int): Role[] {
        const roles: Role[] = [];
        let saboteurs: int = 0;
        if (count <= 4) {
            saboteurs = 1;
        } else if (count <= 6) {
            saboteurs = 2;
        } else if (count <= 9) {
            saboteurs = 3;
        } else {
            saboteurs = 4;
        }
        while (roles.length !== count) {
            if (saboteurs-- > 0) {
                roles.push(Role.Saboteur);
                continue;
            }
            roles.push(Role.Miner);
        }
        return roles;
    }
}
