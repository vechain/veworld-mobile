import { useEffect, useMemo, useState } from "react"
import { Transaction, abi } from "thor-devkit"

import { HexUtils, FormattingUtils, GasUtils } from "~Utils"
import { useThor } from "~Components"
import {
    AccountWithDevice,
    EstimateGasResult,
    FungibleTokenWithBalance,
    NonFungibleToken,
} from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { VET, abis } from "~Constants"

type UseTransactionReturnProps = {
    gas?: EstimateGasResult
    setGas: (gas: EstimateGasResult) => void
    transaction: Transaction.Body
}

type Props = {
    token: FungibleTokenWithBalance | NonFungibleToken
    amount: string
    addressTo: string
}
/**
 * Hook to calculate gas and generate the transaction body based on token, amount and address
 * @param amount - the amount to send
 * @param token - the token to send
 * @param address - the address to send to
 */
export const useTransaction = ({
    amount,
    token,
    addressTo,
}: Props): UseTransactionReturnProps => {
    const [gas, setGas] = useState<EstimateGasResult>()
    const account = useAppSelector(selectSelectedAccount)
    const thorClient = useThor()

    /**
     * Recalculate clauses on data changes
     */
    const clauses = useMemo(() => {
        // if fungible token
        if (token.hasOwnProperty("decimals")) {
            let _token = token as FungibleTokenWithBalance
            return prepareFungibleTokenClause(amount, _token, addressTo)
        }

        // if non fungible token
        if (token.hasOwnProperty("tokenId")) {
            let _token = token as NonFungibleToken
            return prepareNonFungibleTokenClause(
                thorClient,
                _token,
                account,
                addressTo,
            )
        }
    }, [account, addressTo, amount, thorClient, token])

    /**
     * Recalculate transaction on data changes
     */
    const transaction = useMemo((): Transaction.Body => {
        const DEFAULT_GAS_COEFFICIENT = 0
        return {
            chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
            blockRef: thorClient.status.head.id.slice(0, 18),
            expiration: 18,
            clauses: clauses ?? [],
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
                    clauses ?? [],
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

const prepareFungibleTokenClause = (
    amount: string,
    _token: FungibleTokenWithBalance,
    addressTo: string,
) => {
    const scaledAmount =
        "0x" +
        new BigNumber(
            FormattingUtils.scaleNumberUp(amount, _token.decimals),
        ).toString(16)

    // if vet
    if (_token.symbol === VET.symbol) {
        return [
            {
                to: addressTo,
                value: scaledAmount,
                data: "0x",
            },
        ]
    }

    const func = new abi.Function(abis.VIP180.transfer)
    const data = func.encode(addressTo, scaledAmount)

    return [
        {
            to: _token.address,
            value: 0,
            data: data,
        },
    ]
}

const prepareNonFungibleTokenClause = (
    thorClient: Connex.Thor,
    _token: NonFungibleToken,
    account: AccountWithDevice,
    addressTo: string,
) => {
    const clause = thorClient
        .account(_token.belongsToCollectionAddress)
        .method(abis.VIP181.transferFrom)
        .asClause(account.address, addressTo, _token.tokenId)
    //! NOTE: uncomment following line and comment out the line above to create a reverted transaction
    // .asClause(account.address, addressTo, "6969420")

    return [clause]
}
