import { CURRENCY } from "~Common"
import {
    clearVthoExchangeRate,
    updateVthoExchangeRate,
} from "~Storage/Redux/Slices"
import { AppDispatch } from "~Storage/Redux/Types"
import { getExchangeRate } from "./getExchangeRate"

export const fetchVthoExchangeRate =
    (currency: CURRENCY) => async (dispatch: AppDispatch) => {
        try {
            const vthoExchangeRate = await getExchangeRate(currency, "VTHO")

            dispatch(updateVthoExchangeRate(vthoExchangeRate))
        } catch (e) {
            dispatch(clearVthoExchangeRate())
        }
    }
