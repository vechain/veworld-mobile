import { useQueryClient } from "@tanstack/react-query"
import React, { ComponentType, forwardRef, useCallback, useState } from "react"
import { RefreshControlProps } from "react-native"
import { NativeViewGestureHandlerProps, RefreshControl } from "react-native-gesture-handler"
import { useTheme } from "~Hooks"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useTokenBalances } from "../../HomeScreen/Hooks"

type Props = Omit<RefreshControlProps, "onRefresh" | "refreshing" | "tintColor"> & NativeViewGestureHandlerProps

export const PullToRefresh = forwardRef<ComponentType<any>, Props>(function PullToRefresh(props, ref) {
    const [refreshing, setRefreshing] = useState(false)
    const { updateBalances, updateSuggested } = useTokenBalances()
    const queryClient = useQueryClient()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const theme = useTheme()

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

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await Promise.all([updateBalances(true), updateSuggested(), invalidateStargateQueries()])

        setRefreshing(false)
    }, [invalidateStargateQueries, updateBalances, updateSuggested])
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
