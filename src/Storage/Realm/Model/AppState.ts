import { Object } from "realm"

export class AppState extends Object<AppState> {
    _id = "APP_STATE"
    currentState:
        | "active"
        | "background"
        | "inactive"
        | "unknown"
        | "extension" = "active"

    previousState:
        | "active"
        | "background"
        | "inactive"
        | "unknown"
        | "extension" = "unknown"

    static primaryKey = "_id"
}
