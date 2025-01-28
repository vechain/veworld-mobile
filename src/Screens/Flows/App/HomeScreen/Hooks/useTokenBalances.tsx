import {
    autoSelectSuggestTokens,
    resetTokenBalances,
    selectMissingSuggestedTokens,
    selectOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectVisibleBalances,
    updateAccountBalances,
    updateOfficialTokens,
    updateSuggestedTokens,
    useAppDispatch,
    useAppSelector,
    selectNetworkVBDTokens,
    addTokenBalance,
    addOrUpdateCustomTokens,
    selectCustomTokens,
} from "~Storage/Redux"
import { useThor } from "~Components"
import { useCallback, useEffect } from "react"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"

/**
 * This hook is responsible for keeping the available tokens, balances and exchange rates data up to date.
 */
export const useTokenBalances = () => {
    const dispatch = useAppDispatch()

    const network = useAppSelector(selectSelectedNetwork)

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const officialTokens = useAppSelector(selectOfficialTokens)

    const missingSuggestedTokens = useAppSelector(selectMissingSuggestedTokens)

    const balances = useAppSelector(selectVisibleBalances)

    const thorClient = useThor()

    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const customTokens = useAppSelector(selectCustomTokens)

    const updateBalances = useCallback(async () => {
        // Update balances
        if (balances.length > 0) {
            await dispatch(updateAccountBalances(thorClient, selectedAccount.address))
            // Remove once vbd testnet tokens are in github token registery
            if (network.type === "testnet") {
                const vbdTokens = [B3TR, VOT3]
                vbdTokens.forEach(token => {
                    const existsInCustom = customTokens.some(t => compareAddresses(t.address, token.address))
                    const existsInOfficial = officialTokens.some(t => compareAddresses(t.address, token.address))

                    if (!existsInCustom && !existsInOfficial) {
                        dispatch(
                            addOrUpdateCustomTokens({
                                network: network.type,
                                accountAddress: selectedAccount.address,
                                newTokens: vbdTokens,
                            }),
                        )
                    }
                })
            }
        }
    }, [
        B3TR,
        VOT3,
        balances.length,
        customTokens,
        officialTokens,
        dispatch,
        network.type,
        selectedAccount.address,
        thorClient,
    ])

    const updateSuggested = useCallback(async () => {
        await dispatch(updateSuggestedTokens(selectedAccount.address, officialTokens, network))
    }, [dispatch, network, officialTokens, selectedAccount.address])

    // fetch official tokens from github
    useEffect(() => {
        dispatch(updateOfficialTokens(network))
    }, [network, dispatch])

    // fetch suggested tokens
    useEffect(() => {
        if (officialTokens.length <= 2) return

        updateSuggested()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, network.genesis.id, selectedAccount.address, officialTokens.length])

    // auto select suggested tokens if they don't exist already
    useEffect(() => {
        if (
            balances.length === 0 ||
            missingSuggestedTokens.length === 0 ||
            thorClient.genesis.id !== network.genesis.id
        )
            return

        dispatch(autoSelectSuggestTokens(selectedAccount.address, missingSuggestedTokens, network, thorClient))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dispatch,
        missingSuggestedTokens.length,
        selectedAccount.address,
        thorClient.genesis.id,
        network.genesis.id,
        balances.length,
    ])

    /**
     * init default balances if no balances found on redux
     */
    useEffect(() => {
        if (balances.length === 0 && selectedAccount) {
            dispatch(resetTokenBalances)
            // Initialize default token balances
            dispatch(updateAccountBalances(thorClient, selectedAccount.address))

            // Initialize B3TR and VOT3 balances
            const vbdTokens = [B3TR, VOT3]
            vbdTokens.forEach(token => {
                dispatch(
                    addTokenBalance({
                        network: network.type,
                        accountAddress: selectedAccount.address,
                        balance: {
                            balance: "0",
                            tokenAddress: token.address,
                            timeUpdated: new Date().toISOString(),
                            isCustomToken: false,
                            isHidden: false,
                        },
                    }),
                )
            })
        }
    }, [dispatch, thorClient, network, selectedAccount, balances.length, B3TR, VOT3])

    /**
     * keep balances up to date
     */
    useEffect(() => {
        // if genesis id is not the same, it means thorClient is not updated yet
        if (thorClient.genesis.id !== network.genesis.id) return

        updateBalances()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thorClient.genesis.id, network.genesis.id, balances.length, dispatch, selectedAccount.address])

    return {
        updateBalances,
        updateSuggested,
    }
}
