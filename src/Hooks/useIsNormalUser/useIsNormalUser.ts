import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { useEffect, useMemo } from "react"
import { VET } from "~Constants"
import generatedAbi from "~Generated/abi"
import { useMainnetThorClient } from "~Hooks/useThorClient"
import {
    selectAccountsWithoutObserved,
    selectIsNormalUser,
    setIsNormalUser,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { useVetBalances } from "./useVetBalances"

const VET_AMOUNT_THRESHOLD = "10"
const B3TR_ACTIONS_THRESHOLD = 3

const X2EARN_REWARDS_POOL_CONTRACT_MAINNET = "0x6bee7ddab6c99d5b2af0554eaea484ce18f52631"

const getAccountsActions = async (thorClient: ThorClient, addresses: string[]) => {
    const loadedContract = thorClient.contracts.load(X2EARN_REWARDS_POOL_CONTRACT_MAINNET, [
        generatedAbi["RewardDistributed(uint256,indexed bytes32,indexed address,string,indexed address)"],
    ])
    const criteriaSet = addresses.map(
        address => loadedContract.criteria.RewardDistributed({ receiver: address }).criteria,
    )
    const result = await thorClient.logs.filterRawEventLogs({
        criteriaSet,
        options: {
            limit: B3TR_ACTIONS_THRESHOLD,
            offset: 0,
        },
    })
    return result.length >= B3TR_ACTIONS_THRESHOLD
}

export const useIsNormalUser = () => {
    const accounts = useAppSelector(selectAccountsWithoutObserved)
    const cachedIsNormalUser = useAppSelector(selectIsNormalUser)
    const { data: balances } = useVetBalances(!cachedIsNormalUser)
    const dispatch = useAppDispatch()
    const mainnetThorClient = useMainnetThorClient()

    const addresses = useMemo(() => accounts.map(account => account.address), [accounts])

    const { data: hasEnoughB3TRActions } = useQuery({
        queryKey: ["AccountsB3TRActions", addresses],
        queryFn: () => getAccountsActions(mainnetThorClient, addresses),
        enabled: !cachedIsNormalUser,
    })

    const hasEnoughVET = useMemo(
        () =>
            balances
                .reduce((acc, curr) => acc.plus(curr.balance), BigNutils("0"))
                .toHuman(VET.decimals)
                .isBiggerThanOrEqual(VET_AMOUNT_THRESHOLD),
        [balances],
    )

    useEffect(() => {
        if (hasEnoughVET || hasEnoughB3TRActions) dispatch(setIsNormalUser())
    }, [dispatch, hasEnoughB3TRActions, hasEnoughVET])

    return cachedIsNormalUser
}
