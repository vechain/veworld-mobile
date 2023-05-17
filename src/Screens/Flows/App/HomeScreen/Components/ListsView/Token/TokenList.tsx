import React, { memo, useCallback } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { AnimatedTokenCard } from "./AnimatedTokenCard"
import { ColorThemeType, VET, VTHO, useThemedStyles } from "~Common"
import {
    changeBalancePosition,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectNonVechainTokensWithBalances,
    selectTokenWithInfoWithID,
} from "~Storage/Redux/Selectors"
import { AnimatedChartCard } from "./AnimatedChartCard"
import { FungibleTokenWithBalance } from "~Model"

enum TokenIndex {
    vet = 0,
    vtho = 1,
}

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    visibleHeightRef: number
}

export const TokenList = memo(
    ({ isEdit, visibleHeightRef, ...animatedViewProps }: Props) => {
        const dispatch = useAppDispatch()
        const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
        const tokenWithInfo = useAppSelector(state =>
            selectTokenWithInfoWithID(state, [VET.symbol, VTHO.symbol]),
        )

        const { styles } = useThemedStyles(baseStyles)

        const renderSeparator = useCallback(
            () => <BaseSpacer height={16} />,
            [],
        )

        const handleDragEnd = ({
            data,
        }: {
            data: FungibleTokenWithBalance[]
        }) => {
            dispatch(
                changeBalancePosition(
                    data.map(({ balance }, index) => ({
                        ...balance,
                        position: index,
                    })),
                ),
            )
        }

        return (
            <Animated.View style={styles.container} {...animatedViewProps}>
                {tokenWithInfo[0].balance && (
                    <AnimatedChartCard
                        tokenWithInfo={tokenWithInfo[TokenIndex.vet]}
                        isEdit={isEdit}
                    />
                )}
                {tokenWithInfo[1].balance && (
                    <AnimatedChartCard
                        tokenWithInfo={tokenWithInfo[TokenIndex.vtho]}
                        isEdit={isEdit}
                    />
                )}

                <NestableDraggableFlatList
                    data={tokenBalances}
                    extraData={isEdit}
                    onDragEnd={handleDragEnd}
                    keyExtractor={item => item.address}
                    renderItem={itemParams => (
                        <AnimatedTokenCard {...itemParams} isEdit={isEdit} />
                    )}
                    activationDistance={40}
                    showsVerticalScrollIndicator={false}
                    autoscrollThreshold={visibleHeightRef}
                    ItemSeparatorComponent={renderSeparator}
                    contentContainerStyle={styles.paddingTop}
                />
            </Animated.View>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },

        paddingTop: {
            paddingBottom: 24,
            paddingTop: 16,
        },
    })
