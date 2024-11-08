import { Migration2 } from "./Migration2"
import { Migration3 } from "./Migration3"
import { Migration4 } from "./Migration4"
import { Migration5 } from "./Migration5"
import { MigrationManifest } from "redux-persist/es/types"
import { Migration6 } from "./Migration6"
import { Migration7 } from "./Migration7"

export const migrationUpdates: MigrationManifest = {
    2: state => Migration2(state),
    3: state => Migration3(state),
    4: state => Migration4(state),
    5: state => Migration5(state),
    6: state => Migration6(state),
    7: state => Migration7(state),
}
