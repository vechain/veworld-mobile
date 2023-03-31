import React, { memo, useCallback, useEffect, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { AnimatedTokenCard } from "./AnimatedTokenCard"
import { ColorThemeType, useThemedStyles } from "~Common"
import { useAppSelector } from "~Storage/Redux"
import {
    selectCurrency,
    selectDenormalizedAccountTokenBalances,
} from "~Storage/Redux/Selectors"
import { DenormalizedAccountTokenBalance } from "~Storage/Redux/Types"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    visibleHeightRef: number
}

export const TokenList = memo(
    ({ isEdit, visibleHeightRef, ...animatedViewProps }: Props) => {
        const tokenBalances: DenormalizedAccountTokenBalance[] = useAppSelector(
            selectDenormalizedAccountTokenBalances,
        )
        const [data, setData] = useState<DenormalizedAccountTokenBalance[]>([])

        useEffect(() => {
            setData(tokenBalances)
        }, [tokenBalances])

        const { styles } = useThemedStyles(baseStyles)

        const renderSeparator = useCallback(
            () => <BaseSpacer height={16} />,
            [],
        )

        const onDeleteItem = useCallback(
            (_item: DenormalizedAccountTokenBalance) => {
                console.log("onDeleteItem", _item)
            },
            [],
        )

        const selectedCurrency = useAppSelector(selectCurrency)

        return (
            <Animated.View style={styles.container} {...animatedViewProps}>
                {/* TODO: reintroduce default native tokens
                <AnimatedChartCard
                    token={NATIVE_TOKENS[0]}
                    isEdit={isEdit}
                    selectedCurrency={selectedCurrency}
                />
                <AnimatedVTHOCard
                    token={NATIVE_TOKENS[1]}
                    isEdit={isEdit}
                    selectedCurrency={selectedCurrency}
                /> */}

                <NestableDraggableFlatList
                    data={data}
                    extraData={isEdit}
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    onDragEnd={({ data }) => setData(data)}
                    keyExtractor={item => item.tokenAddress}
                    renderItem={itemParams => (
                        <AnimatedTokenCard
                            {...itemParams}
                            isEdit={isEdit}
                            onDeleteItem={onDeleteItem}
                            selectedCurrency={selectedCurrency}
                        />
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
