import { useEffect, useMemo, useState } from "react"
import { Transaction, abi } from "thor-devkit"
import { VET } from "~Common"
import { HexUtils, FormattingUtils, GasUtils } from "~Utils"
import { useThor } from "~Components"
import { EstimateGasResult, FungibleTokenWithBalance } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { abis } from "~Common/Constant/Thor/ThorConstants"

export const useSendTransaction = ({
    amount,
    token,
    address,
}: {
    token: FungibleTokenWithBalance
    amount: string
    address: string
}) => {
    const [gas, setGas] = useState<EstimateGasResult>()
    const account = useAppSelector(selectSelectedAccount)
    const thorClient = useThor()

    /**
     * recalculate clauses on data changes
     */
    const clauses = useMemo(() => {
        const scaledAmount =
            "0x" +
            new BigNumber(
                FormattingUtils.scaleNumberUp(amount, token.decimals),
            ).toString(16)
        // if vet
        if (token.symbol === VET.symbol) {
            return [
                {
                    to: address,
                    value: scaledAmount,
                    data: "0x",
                },
            ]
        }
        // if fungible token
        const func = new abi.Function(abis.VIP180.transfer)
        const data = func.encode(address, scaledAmount)
        return [
            {
                to: token.address,
                value: 0,
                data: data,
            },
        ]
    }, [address, amount, token.address, token.decimals, token.symbol])
    /**
     * recalculate transaction on data changes
     */
    const transaction = useMemo((): Transaction.Body => {
        const DEFAULT_GAS_COEFFICIENT = 0
        return {
            chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
            blockRef: thorClient.status.head.id.slice(0, 18),
            expiration: 18,
            clauses,
            gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
            gas: gas?.gas || "0",
            dependsOn: null, // NOTE: in extension it is null
            nonce: HexUtils.generateRandom(8),
        }
    }, [clauses, thorClient.genesis.id, thorClient.status.head.id, gas?.gas])

    useEffect(() => {
        if (account) {
            ;(async () => {
                const estimatedGas = await GasUtils.estimateGas(
                    thorClient,
                    clauses,
                    0, // NOTE: suggestedGas: 0;  in extension it was fixed 0
                    account.address,
                    // NOTE: gasPayer: undefined; in extension it was not used
                )
                setGas(estimatedGas)
            })()
        }
    }, [account, clauses, thorClient])

    return { gas, setGas, transaction }
}
