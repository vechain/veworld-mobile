import React, { memo, useCallback } from "react"
import { ViewProps } from "react-native"
import { NestableDraggableFlatList, RenderItem } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { useTokenWithCompleteInfo, TokenWithCompleteInfo } from "~Hooks"
import { B3TR, VET, VTHO } from "~Constants"
import { changeBalancePosition, useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { FungibleTokenWithBalance } from "~Model"
import { AccountUtils, BalanceUtils } from "~Utils"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { AnimatedTokenListItem } from "./AnimatedTokenListItem"
import HapticsService from "~Services/HapticsService"

interface Props extends AnimateProps<ViewProps> {
    isBalanceVisible: boolean
}

export const TokenList = memo(({ isBalanceVisible, ...animatedViewProps }: Props) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)

    const handleDragEnd = ({ data }: { data: FungibleTokenWithBalance[] }) => {
        dispatch(
            changeBalancePosition({
                network: network.type,
                accountAddress: selectedAccount.address,
                updatedAccountBalances: data.map(({ balance }, index) => ({
                    ...balance,
                    position: index,
                })),
            }),
        )
    }

    const nav = useNavigation()

    const onTokenPress = useCallback(
        (token: FungibleTokenWithBalance) => {
            const isTokenBalance = BalanceUtils.getIsTokenWithBalance(token)

            if (isTokenBalance) {
                if (AccountUtils.isObservedAccount(selectedAccount)) return

                nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                    token,
                })
            }
        },
        [selectedAccount, nav],
    )

    const onVechainTokenPress = useCallback(
        (tokenWithInfo: TokenWithCompleteInfo) => {
            HapticsService.triggerImpact({ level: "Light" })
            nav.navigate(Routes.TOKEN_DETAILS, { token: tokenWithInfo })
        },
        [nav],
    )

    const renderItem: RenderItem<FungibleTokenWithBalance> = useCallback(
        ({ item, getIndex, isActive, drag }) => {
            return (
                <AnimatedTokenListItem
                    type="nonVet"
                    item={item}
                    isActive={isActive}
                    getIndex={getIndex}
                    drag={drag}
                    isBalanceVisible={isBalanceVisible}
                    onTokenPress={onTokenPress}
                />
            )
        },
        [isBalanceVisible, onTokenPress],
    )

    return (
        <Animated.View {...animatedViewProps}>
            <AnimatedTokenListItem
                type="vetEcosystem"
                tokenWithInfo={tokenWithInfoVET}
                isBalanceVisible={isBalanceVisible}
                onPress={() => onVechainTokenPress(tokenWithInfoVET)}
            />
            <AnimatedTokenListItem
                type="vetEcosystem"
                tokenWithInfo={tokenWithInfoVTHO}
                isBalanceVisible={isBalanceVisible}
                onPress={() => onVechainTokenPress(tokenWithInfoVTHO)}
            />
            <AnimatedTokenListItem
                type="vetEcosystem"
                tokenWithInfo={tokenWithInfoB3TR}
                isBalanceVisible={isBalanceVisible}
                onPress={() => onVechainTokenPress(tokenWithInfoB3TR)}
            />

            <NestableDraggableFlatList
                data={tokenBalances}
                onDragEnd={handleDragEnd}
                keyExtractor={item => item.address}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                activationDistance={30}
            />
        </Animated.View>
    )
})
