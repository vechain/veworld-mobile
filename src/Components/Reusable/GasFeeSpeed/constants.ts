import moment from "moment"
import { GasPriceCoefficient } from "~Constants"

export const SPEED_MAP = {
    [GasPriceCoefficient.HIGH]: moment.duration(15, "seconds"),
    [GasPriceCoefficient.MEDIUM]: moment.duration(25, "seconds"),
    [GasPriceCoefficient.REGULAR]: moment.duration(40, "seconds"),
}
