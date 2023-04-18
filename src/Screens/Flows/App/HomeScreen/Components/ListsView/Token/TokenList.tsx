import React, { memo, useCallback } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { AnimatedTokenCard } from "./AnimatedTokenCard"
import { ColorThemeType, useThemedStyles } from "~Common"
import {
    changeBalancePosition,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    getVetDenormalizedAccountTokenBalances,
    getVthoDenormalizedAccountTokenBalances,
    selectNonVechainDenormalizedAccountTokenBalances,
} from "~Storage/Redux/Selectors"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"
import { AnimatedChartCard } from "./AnimatedChartCard"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    visibleHeightRef: number
}

export const TokenList = memo(
    ({ isEdit, visibleHeightRef, ...animatedViewProps }: Props) => {
        const dispatch = useAppDispatch()
        const tokenBalances: DenormalizedAccountTokenBalance[] = useAppSelector(
            selectNonVechainDenormalizedAccountTokenBalances,
        )
        const vetBalance: DenormalizedAccountTokenBalance | undefined =
            useAppSelector(getVetDenormalizedAccountTokenBalances)
        const vthoBalance: DenormalizedAccountTokenBalance | undefined =
            useAppSelector(getVthoDenormalizedAccountTokenBalances)

        const { styles } = useThemedStyles(baseStyles)

        const renderSeparator = useCallback(
            () => <BaseSpacer height={16} />,
            [],
        )

        const handleDragEnd = ({
            data,
        }: {
            data: DenormalizedAccountTokenBalance[]
        }) => {
            dispatch(
                changeBalancePosition(
                    data.map(
                        ({ token: _token, ...otherAttributes }, index) => ({
                            ...otherAttributes,
                            position: index,
                        }),
                    ),
                ),
            )
        }

        return (
            <Animated.View style={styles.container} {...animatedViewProps}>
                {vetBalance && (
                    <AnimatedChartCard
                        tokenBalance={vetBalance}
                        isEdit={isEdit}
                    />
                )}
                {vthoBalance && (
                    <AnimatedChartCard
                        tokenBalance={vthoBalance}
                        isEdit={isEdit}
                    />
                )}

                <NestableDraggableFlatList
                    data={tokenBalances}
                    extraData={isEdit}
                    onDragEnd={handleDragEnd}
                    keyExtractor={item => item.tokenAddress}
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
