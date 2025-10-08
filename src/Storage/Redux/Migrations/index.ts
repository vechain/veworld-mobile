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
import { Migration13 } from "./Migration13"
import { Migration14 } from "./Migration14"
import { Migration15 } from "./Migration15"
import { Migration16 } from "./Migration16"
import { Migration17 } from "./Migration17"
import { Migration18 } from "./Migration18"
import { Migration19 } from "./Migration19"
import { Migration20 } from "./Migration20"
import { Migration21 } from "./Migration21"
import { Migration22 } from "./Migration22"
import { Migration23 } from "./Migration23"
import { Migration24 } from "./Migration24"
import { Migration25 } from "./Migration25"
import { Migration26 } from "./Migration26"
import { Migration27 } from "./Migration27"
import { Migration28 } from "./Migration28"
import { Migration29 } from "./Migration29"
import { Migration30 } from "./Migration30"
import { Migration31 } from "./Migration31"

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
    13: state => Migration13(state),
    14: state => Migration14(state),
    15: state => Migration15(state),
    16: state => Migration16(state),
    17: state => Migration17(state),
    18: state => Migration18(state),
    19: state => Migration19(state),
    20: state => Migration20(state),
    21: state => Migration21(state),
    22: state => Migration22(state),
    23: state => Migration23(state),
    24: state => Migration24(state),
    25: state => Migration25(state),
    26: state => Migration26(state),
    27: state => Migration27(state),
    28: state => Migration28(state),
    29: state => Migration29(state),
    30: state => Migration30(state),
    31: state => Migration31(state),
}
