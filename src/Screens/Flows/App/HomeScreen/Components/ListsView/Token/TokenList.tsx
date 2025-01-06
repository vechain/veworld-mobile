import React, { memo, useCallback } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList, RenderItem } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { AnimatedTokenCard } from "./AnimatedTokenCard"
import { useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { B3TR, ColorThemeType, VET, VTHO } from "~Constants"
import { changeBalancePosition, useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { AnimatedChartCard } from "./AnimatedChartCard"
import { FungibleTokenWithBalance } from "~Model"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenList = memo(({ isEdit, isBalanceVisible, ...animatedViewProps }: Props) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)

    const { styles } = useThemedStyles(baseStyles)

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

    const renderItem: RenderItem<FungibleTokenWithBalance> = useCallback(
        ({ item, getIndex, isActive, drag }) => {
            return (
                <AnimatedTokenCard
                    item={item}
                    isActive={isActive}
                    getIndex={getIndex}
                    drag={drag}
                    isEdit={isEdit}
                    isBalanceVisible={isBalanceVisible}
                />
            )
        },
        [isBalanceVisible, isEdit],
    )

    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            <AnimatedChartCard tokenWithInfo={tokenWithInfoVET} isEdit={isEdit} isBalanceVisible={isBalanceVisible} />
            <AnimatedChartCard tokenWithInfo={tokenWithInfoVTHO} isEdit={isEdit} isBalanceVisible={isBalanceVisible} />
            <AnimatedChartCard tokenWithInfo={tokenWithInfoB3TR} isEdit={isEdit} isBalanceVisible={isBalanceVisible} />

            <NestableDraggableFlatList
                data={tokenBalances}
                extraData={isEdit}
                onDragEnd={handleDragEnd}
                keyExtractor={item => item.address}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                activationDistance={30}
            />
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
    })
