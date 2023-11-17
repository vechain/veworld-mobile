import { BigNumber } from "bignumber.js"
import { useCallback, useEffect, useState } from "react"
import { useThor } from "~Components"
import { VTHO, VTHO_GAS_ESTIMATE, abis } from "~Constants"
import { FungibleTokenWithBalance } from "~Model"

export const BASE_GAS_PRICE_FN_SIG =
    "0x000000000000000000000000000000000000626173652d6761732d7072696365"

export const DEFAULT_GAS_COEFFICIENT = 0

const paramsCache: Record<string, string> = {}

export const useCalculateGas = ({
    token,
}: {
    token: FungibleTokenWithBalance
}) => {
    const thor = useThor()

    const [vthoEstimate, setVthoEstimate] = useState(new BigNumber(0))

    const getBaseGasPrice = useCallback(async (): Promise<string> => {
        const k = `${thor.genesis.id}-${BASE_GAS_PRICE_FN_SIG}`

        if (paramsCache[k]) {
            return paramsCache[k]
        } else {
            const address = "0x0000000000000000000000000000506172616d73"
            const result = await thor
                .account(address)
                .method(abis.paramsGet)
                .cache([address])
                .call(BASE_GAS_PRICE_FN_SIG)

            paramsCache[k] = result.data
            return result.data
        }
    }, [thor])

    const calculateFee = useCallback(
        async (
            gas: BigNumber | number,
            gasPriceCoef: number,
        ): Promise<BigNumber> => {
            const baseGasPrice = await getBaseGasPrice()
            return new BigNumber(baseGasPrice)
                .times(gasPriceCoef)
                .idiv(255)
                .plus(baseGasPrice)
                .times(gas)
        },
        [getBaseGasPrice],
    )

    useEffect(() => {
        if (token.symbol === VTHO.symbol) {
            calculateFee(VTHO_GAS_ESTIMATE, DEFAULT_GAS_COEFFICIENT).then(
                fee => {
                    setVthoEstimate(fee)
                },
            )
        }
    }, [calculateFee, token])

    return vthoEstimate
}
