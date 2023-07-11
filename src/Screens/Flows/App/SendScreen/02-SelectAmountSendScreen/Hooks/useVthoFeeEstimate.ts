import BigNumber from "bignumber.js"
import { useEffect, useState } from "react"
import { useThor } from "~Components"
import { DEFAULT_GAS_COEFFICIENT, VTHO, VTHO_GAS_ESTIMATE } from "~Constants"
import { FormattingUtils, GasUtils } from "~Utils"

/**
 * calculate the vtho fee estimate
 * @param skip skip the calculation
 */
export const useVthoFeeEstimate = ({
    skip,
}: {
    skip?: boolean
}): {
    vthoFeeEstimate: BigNumber
} => {
    const [vthoFeeEstimate, setVthoFeeEstimate] = useState(new BigNumber(0))
    const thor = useThor()

    useEffect(() => {
        if (!skip) {
            GasUtils.calculateFee(
                thor,
                VTHO_GAS_ESTIMATE,
                DEFAULT_GAS_COEFFICIENT,
            ).then(fee => {
                setVthoFeeEstimate(
                    fee
                        ? new BigNumber(
                              FormattingUtils.scaleNumberDown(
                                  fee,
                                  VTHO.decimals,
                                  VTHO.decimals,
                              ),
                          )
                        : new BigNumber(0),
                )
            })
        }
    }, [skip, thor])

    return {
        vthoFeeEstimate,
    }
}
