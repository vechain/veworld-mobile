import { CURRENCY } from "~Common"
import {
    clearVetExchangeRate,
    updateVetExchangeRate,
} from "~Storage/Redux/Slices"
import { AppDispatch } from "~Storage/Redux/Types"
import { getExchangeRate } from "./getExchangeRate"

export const fetchVetExchangeRate =
    (currency: CURRENCY) => async (dispatch: AppDispatch) => {
        try {
            const vetExchangeRate = await getExchangeRate(currency, "VET")

            dispatch(updateVetExchangeRate(vetExchangeRate))
        } catch (e) {
            dispatch(clearVetExchangeRate())
        }
    }
