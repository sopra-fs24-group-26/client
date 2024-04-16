import { PlayerDTO } from "definitions/dto";
import { Role } from "definitions/enums";
import { UUID, Nullable, int } from "definitions/utils";
import { Session } from "./Session";
import SessionManager from "managers/SessionManager";
import { assert, seededShuffle } from "utilities/utils";

export class Player {
    public readonly id: UUID;
    public readonly name: string;
    public readonly orderIndex: Nullable<int>;
    public readonly role: Nullable<Role>;

    public constructor(dto: PlayerDTO, count: int) {
        this.id = dto.id;
        this.name = dto.name;
        this.orderIndex = dto.orderIndex;
        this.role = this.getRole(count, this.orderIndex);
    }

    private getRole(count: int, index: Nullable<int>): Nullable<Role> {
        if (index === null) {
            return null;
        }
        const session: Nullable<Session> = SessionManager.getSession();
        assert(session);
        const roles: Role[] = this.generateRoles(count);
        return seededShuffle(roles, session.seed)[index];
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
