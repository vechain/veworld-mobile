import React, { memo, useCallback, useState } from "react"
import { StyleSheet, View, ViewProps } from "react-native"
import { NestableDraggableFlatList } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { AnimatedTokenCard } from "./TokenCard"
import { ColorThemeType, Tokens_mock, useThemedStyles, Token } from "~Common"

import { Chart, Line, Area } from "react-native-responsive-linechart"
import DropShadow from "react-native-drop-shadow"

const NATIVE_TOKENS = [
    { key: "1", symbol: "VET", name: "Vechain" },
    { key: "2", symbol: "VTHO", name: "VeThor Token" },
]

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    visibleHeightRef: number
}

const HEIGHT = 100

export const TokenList = memo(
    ({ isEdit, visibleHeightRef, ...animatedViewProps }: Props) => {
        const [data, setData] = useState<Token[]>(Tokens_mock)

        const { styles } = useThemedStyles(baseStyles)

        const renderSeparator = useCallback(
            () => <BaseSpacer height={16} />,
            [],
        )

        const onDeleteItem = useCallback((_item: Token) => {
            console.log("onDeleteItem", _item)
        }, [])

        return (
            <Animated.View style={styles.container} {...animatedViewProps}>
                {NATIVE_TOKENS.map(token => (
                    <ChartCard token={token} key={token.key} />
                ))}

                <NestableDraggableFlatList
                    data={data}
                    extraData={isEdit}
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    onDragEnd={({ data }) => setData(data)}
                    keyExtractor={item => item.address}
                    renderItem={itemParams => (
                        <AnimatedTokenCard
                            {...itemParams}
                            isEdit={isEdit}
                            onDeleteItem={onDeleteItem}
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
            marginBottom: 24,
            paddingTop: 16,
        },

        // Native token card styles

        nativeTokenContainer: {
            height: 162,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: theme.colors.background,
            marginBottom: 10,
            borderRadius: 16,
            overflow: "hidden",
            marginHorizontal: 20,
        },

        innerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingHorizontal: 12,
        },
        tokenIcon: {
            width: 40,
            height: 40,
            backgroundColor: "red",
            borderRadius: 20,
            marginRight: 10,
            marginLeft: 12,
            position: "absolute",
        },
        textMargin: {
            marginLeft: 50,
        },

        cardDhadow: theme.shadows.card,
    })

const ChartCard = ({ token }: { token: (typeof NATIVE_TOKENS)[0] }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <DropShadow style={styles.cardDhadow}>
            <BaseView style={styles.nativeTokenContainer}>
                <View style={styles.innerRow}>
                    <View style={styles.tokenIcon} />

                    <View style={styles.textMargin}>
                        <BaseText typographyFont="subTitle">
                            {token.name}
                        </BaseText>
                        <BaseText>{token.symbol}</BaseText>
                    </View>

                    <View>
                        <BaseText typographyFont="title">0.2202$</BaseText>
                        <BaseText>0.36</BaseText>
                    </View>
                </View>

                <BaseView w={100} style={{ height: HEIGHT }}>
                    {/* https://github.com/bluephoton/react-native-responsive-linechart/commit/f5257ce0c982d4918b93e1542c5ab52917808bac */}
                    {/*
                    // @ts-ignore */}
                    <Chart
                        disableGestures
                        disableTouch
                        style={{ height: HEIGHT }}
                        data={[
                            { x: -2, y: 15 },
                            { x: -1, y: 10 },
                            { x: 0, y: 12 },
                            { x: 5, y: 8 },
                            { x: 6, y: 12 },
                            { x: 7, y: 14 },
                            { x: 8, y: 12 },
                            { x: 9, y: 13.5 },
                            { x: 10, y: 18 },
                        ]}
                        xDomain={{ min: -2, max: 10 }}
                        yDomain={{ min: -4, max: 20 }}>
                        <>
                            <Area
                                theme={{
                                    gradient: {
                                        from: {
                                            color: theme.colors.primary,
                                        },
                                        to: {
                                            color: theme.colors.primary,
                                            opacity: 0.1,
                                        },
                                    },
                                }}
                            />
                            <Line
                                theme={{
                                    stroke: {
                                        color: theme.colors.primary,
                                        width: 3,
                                    },
                                }}
                            />
                        </>
                    </Chart>
                </BaseView>
            </BaseView>
        </DropShadow>
    )
}
