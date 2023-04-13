import { CURRENCY, error } from "~Common"
import { VeChainToken } from "~Model"
import { clearExchangeRate, updateExchangeRate } from "~Storage/Redux/Slices"
import { getExchangeRate } from "./getExchangeRate"
import { AppThunk } from "~Storage/Redux/Types"

export const fetchExchangeRate =
    (tokenSymbol: VeChainToken, currency: CURRENCY): AppThunk =>
    async dispatch => {
        try {
            const vetExchangeRate = await getExchangeRate(currency, tokenSymbol)

            dispatch(
                updateExchangeRate({
                    token: tokenSymbol,
                    rate: vetExchangeRate,
                }),
            )
        } catch (e) {
            error(e)
            dispatch(clearExchangeRate(tokenSymbol))
        }
    }
