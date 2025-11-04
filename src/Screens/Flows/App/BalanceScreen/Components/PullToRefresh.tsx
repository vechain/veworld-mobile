import { useQueryClient } from "@tanstack/react-query"
import React, { ComponentType, forwardRef, useCallback, useState } from "react"
import { RefreshControlProps } from "react-native"
import { NativeViewGestureHandlerProps, RefreshControl } from "react-native-gesture-handler"
import { useTheme } from "~Hooks"
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

    const invalidateBalanceQueries = useCallback(async () => {
        await dispatch(updateAccountBalances(selectedAccountAddress!, queryClient))
    }, [dispatch, queryClient, selectedAccountAddress])

    const invalidateTokens = useCallback(async () => {
        await dispatch(invalidateUserTokens(selectedAccountAddress!, queryClient))
    }, [dispatch, queryClient, selectedAccountAddress])

    const invalidateActivity = useCallback(() => {
        return queryClient.invalidateQueries({
            predicate(query) {
                if (query.queryKey[0] !== "BALANCE_ACTIVITIES") return false
                if (query.queryKey.length !== 4) return false
                if (query.queryKey[2] !== selectedNetwork.genesis.id) return false
                if (!AddressUtils.compareAddresses(query.queryKey[3] as string | undefined, selectedAccountAddress!))
                    return false
                return true
            },
        })
    }, [queryClient, selectedAccountAddress, selectedNetwork.genesis.id])

    const invalidateStargateQueries = useCallback(async () => {
        await queryClient.invalidateQueries({
            predicate(query) {
                if (!["userStargateNodes", "userStargateNfts"].includes(query.queryKey[0] as string)) return false
                if (query.queryKey.length < 3) return false
                if (query.queryKey[1] !== selectedNetwork.type) return false
                if (!AddressUtils.compareAddresses(query.queryKey[2] as string | undefined, selectedAccountAddress!))
                    return false
                return true
            },
        })
    }, [queryClient, selectedAccountAddress, selectedNetwork.type])

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

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await Promise.all([
            invalidateStargateQueries(),
            invalidateBalanceQueries(),
            invalidateTokens(),
            invalidateActivity(),
            invalidateCollectiblesQueries(),
        ])

        setRefreshing(false)
    }, [
        invalidateActivity,
        invalidateBalanceQueries,
        invalidateCollectiblesQueries,
        invalidateStargateQueries,
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
