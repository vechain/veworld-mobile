import { Migration2 } from "./Migration2"
import { Migration3 } from "./Migration3"
import { MigrationManifest } from "redux-persist/es/types"
import { Migration4 } from "~Storage/Redux/Migrations/Migration4"

export const migrationUpdates: MigrationManifest = {
    2: Migration2,
    3: Migration3,
    4: Migration4,
}
