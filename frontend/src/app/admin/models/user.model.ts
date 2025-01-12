import { Role } from "./role.model";

export class User {
    id?: string;
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_active?: string;
    is_staff?: string;
    is_superuser?: string;
    date_joined?: Date;

    role?: string;
}