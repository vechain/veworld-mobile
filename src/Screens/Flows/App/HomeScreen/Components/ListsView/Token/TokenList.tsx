import React, { memo, useCallback, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { NestableDraggableFlatList } from "react-native-draggable-flatlist"
import Animated, { AnimateProps } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { AnimatedTokenCard } from "./TokenCard"
import { ColorThemeType, Tokens_mock, useThemedStyles, Token } from "~Common"
import { FlashList } from "@shopify/flash-list"

interface Props extends AnimateProps<ViewProps> {
    isEdit: boolean
    visibleHeightRef: number
}

export const TokenList = memo(
    ({ isEdit, visibleHeightRef, ...animatedViewProps }: Props) => {
        const [data, setData] = useState<Token[]>(Tokens_mock)

        const { styles } = useThemedStyles(baseStyles)

        const renderSeparator = useCallback(
            () => <BaseSpacer height={10} />,
            [],
        )

        const onDeleteItem = useCallback((_item: Token) => {
            console.log("onDeleteItem", _item)
        }, [])

        return (
            <Animated.View style={styles.container} {...animatedViewProps}>
                <FlashList
                    data={[
                        { key: "1", label: "VET" },
                        { key: "2", label: "VTHO" },
                    ]}
                    keyExtractor={item => item.key}
                    renderItem={({ item }) => {
                        return (
                            <BaseView style={styles.nativeTokenContainer}>
                                <BaseText>{item.label}</BaseText>
                            </BaseView>
                        )
                    }}
                    estimatedItemSize={162}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={renderSeparator}
                />

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
        nativeTokenContainer: {
            height: 162,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background,
            marginBottom: 10,
            borderWidth: 1,
            borderRadius: 10,
            marginHorizontal: 20,
        },
    })
