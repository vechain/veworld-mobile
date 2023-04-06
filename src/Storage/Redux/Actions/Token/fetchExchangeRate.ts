import { CURRENCY, error } from "~Common"
import { VeChainToken } from "~Model"
import { clearExchangeRate, updateExchangeRate } from "~Storage/Redux/Slices"
import { AppDispatch } from "~Storage/Redux/Types"
import { getExchangeRate } from "./getExchangeRate"

export const fetchExchangeRate =
    (tokenSymbol: VeChainToken, currency: CURRENCY) =>
    async (dispatch: AppDispatch) => {
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
