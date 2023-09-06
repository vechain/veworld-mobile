import { Migration2 } from "./Migration2"
import { Migration3 } from "./Migration3"
import { MigrationManifest } from "redux-persist/es/types"

export const migrationUpdates: MigrationManifest = {
    2: state => Migration2(state),
    3: state => Migration3(state),
}
