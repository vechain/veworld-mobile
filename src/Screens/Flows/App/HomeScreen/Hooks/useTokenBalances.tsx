import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    getSelectedAccount,
    getCurrentNetwork,
    getAccountBalances,
} from "~Storage/Redux/Selectors"
import { FungibleToken, NETWORK_TYPE } from "~Model"
import {
    defaultTokensMain,
    defaultTokensTest,
} from "~Common/Constant/Token/TokenConstants"
import { updateAccountBalances } from "~Services/BalanceService/BalanceService"
import { setTokenBalances } from "~Storage/Redux/Slices"
import { useThor } from "~Components"
import { useGetTokensFromGithubQuery } from "~Storage/Redux/Api"
import { useEffect } from "react"

/**
 * This component is responsible for keeping the available tokens, balances and currency data up to date.
 * We will use hooks to trigger calls to the external services we use to update this date.
 * The reason this is a separate component is in order to remove any dependencies on these external services.
 * If they are down we want the wallet to continue to function.
 */
export const useTokenBalances = () => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getSelectedAccount)
    const currentNetwork = useAppSelector(getCurrentNetwork)
    const balances = useAppSelector(getAccountBalances)
    const thorClient = useThor()

    useGetTokensFromGithubQuery({
        networkGenesisId: currentNetwork.genesisId,
        networkType: currentNetwork.type as NETWORK_TYPE,
    })

    /**
     * init default balances
     */
    useEffect(() => {
        if (
            currentAccount?.address &&
            currentNetwork.genesisId &&
            balances?.length === 0
        ) {
            let defaultTokens: FungibleToken[] = []
            if (currentNetwork.type === NETWORK_TYPE.MAIN) {
                defaultTokens = defaultTokensMain
            }
            if (currentNetwork.type === NETWORK_TYPE.TEST) {
                defaultTokens = defaultTokensTest
            }
            dispatch(
                setTokenBalances(
                    defaultTokens.map(token => ({
                        accountAddress: currentAccount?.address,
                        tokenAddress: token.address,
                        balance: "0",
                        timeUpdated: new Date().toISOString(),
                    })),
                ),
            )
            dispatch(updateAccountBalances(thorClient))
        }
    }, [
        currentNetwork.genesisId,
        currentNetwork.type,
        currentAccount?.address,
        dispatch,
        thorClient,
        balances,
    ])
}
