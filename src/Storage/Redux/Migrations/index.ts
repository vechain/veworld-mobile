import { Migration2 } from "./Migration2"
import { Migration3 } from "./Migration3"
import { Migration4 } from "./Migration4"
import { Migration5 } from "./Migration5"
import { MigrationManifest } from "redux-persist/es/types"
import { Migration6 } from "./Migration6"
import { Migration7 } from "./Migration7"
import { Migration8 } from "./Migration8"
import { Migration9 } from "./Migration9"
import { Migration10 } from "./Migration10"
import { Migration11 } from "./Migration11"
import { Migration12 } from "./Migration12"

export const migrationUpdates: MigrationManifest = {
    2: state => Migration2(state),
    3: state => Migration3(state),
    4: state => Migration4(state),
    5: state => Migration5(state),
    6: state => Migration6(state),
    7: state => Migration7(state),
    8: state => Migration8(state),
    9: state => Migration9(state),
    10: state => Migration10(state),
    11: state => Migration11(state),
    12: state => Migration12(state),
}
