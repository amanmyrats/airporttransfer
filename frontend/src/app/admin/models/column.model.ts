import { User } from "./user.model";

export class Column {
    id?: string;
    user?: string;
    user_obj?: User;
    table_name?: string;
    field?: string;
    header?: string;
    width?: number;
    min_width?: number;
    max_width?: number;
    index?: number;
    is_visible?: boolean;
}