import { useQueryClient } from "@tanstack/react-query"
import React, { ComponentType, forwardRef, useCallback, useState } from "react"
import { RefreshControlProps } from "react-native"
import { NativeViewGestureHandlerProps, RefreshControl } from "react-native-gesture-handler"
import { useTheme } from "~Hooks"
import { useStargateInvalidation } from "~Hooks/useStargateInvalidation"
import {
    invalidateUserTokens,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"

type Props = Omit<RefreshControlProps, "onRefresh" | "refreshing" | "tintColor"> & NativeViewGestureHandlerProps

export const PullToRefresh = forwardRef<ComponentType<any>, Props>(function PullToRefresh(props, ref) {
    const [refreshing, setRefreshing] = useState(false)
    const queryClient = useQueryClient()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const { invalidate: invalidateStargate } = useStargateInvalidation()

    const invalidateBalanceQueries = useCallback(async () => {
        await dispatch(updateAccountBalances(selectedAccountAddress!, queryClient))
    }, [dispatch, queryClient, selectedAccountAddress])

    const invalidateTokens = useCallback(async () => {
        await dispatch(invalidateUserTokens(selectedAccountAddress!, queryClient))
    }, [dispatch, queryClient, selectedAccountAddress])

    const invalidateActivity = useCallback(() => {
        return queryClient.invalidateQueries({
            predicate(query) {
                const queryKey = query.queryKey as string[]
                if (!["BALANCE_ACTIVITIES", "TOKEN_ACTIVITIES"].includes(queryKey[0])) return false
                if (queryKey.length < 4) return false
                if (queryKey[1] !== selectedNetwork.genesis.id) return false
                if (!AddressUtils.compareAddresses(queryKey[2], selectedAccountAddress!)) return false
                return true
            },
        })
    }, [queryClient, selectedAccountAddress, selectedNetwork.genesis.id])

    const invalidateStargateQueries = useCallback(async () => {
        if (!selectedAccountAddress) return
        await invalidateStargate([selectedAccountAddress])
    }, [invalidateStargate, selectedAccountAddress])

    const invalidateCollectiblesQueries = useCallback(async () => {
        await queryClient.invalidateQueries({
            predicate(query) {
                const queryKey = query.queryKey as string[]
                if (!["COLLECTIBLES"].includes(queryKey[0])) return false
                if (queryKey.length < 4) return false
                if (queryKey[2] !== selectedNetwork.genesis.id) return false
                if (!AddressUtils.compareAddresses(queryKey[3], selectedAccountAddress!)) return false
                return true
            },
        })
    }, [queryClient, selectedAccountAddress, selectedNetwork.genesis.id])

    const invalidateStargateTotalStats = useCallback(async () => {
        await queryClient.invalidateQueries({
            predicate(query) {
                return [
                    "STARGATE_TOTAL_SUPPLY",
                    "STARGATE_TOTAL_VET_STAKED",
                    "STARGATE_REWARDS_DISTRIBUTED",
                    "STARGATE_VTHO_PER_DAY",
                ].includes(query.queryKey[0] as string)
            },
        })
    }, [queryClient])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await Promise.all([
            invalidateStargateQueries(),
            invalidateBalanceQueries(),
            invalidateTokens(),
            invalidateActivity(),
            invalidateCollectiblesQueries(),
            invalidateStargateTotalStats(),
        ])

        setRefreshing(false)
    }, [
        invalidateActivity,
        invalidateBalanceQueries,
        invalidateCollectiblesQueries,
        invalidateStargateQueries,
        invalidateStargateTotalStats,
        invalidateTokens,
    ])
    return (
        <RefreshControl
            onRefresh={onRefresh}
            tintColor={theme.colors.border}
            refreshing={refreshing}
            ref={ref}
            {...props}
        />
    )
})
