import { Pressable, StyleSheet } from "react-native"
import React, { memo, useCallback, useMemo, useState } from "react"
import { BaseText, BaseView } from "~Components"
import Animated, { FadeIn } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { ActiveHomePageTab, useRealm } from "~Storage"

const entries = [
    {
        label: "Token",
        value: 0,
    },
    {
        label: "NFT",
        value: 1,
    },
]

export const TabbarHeader = memo(() => {
    const { styles } = useThemedStyles(baseStyles)
    const [activeTab, setActiveTab] = useState(0)
    const { cache } = useRealm()

    const onTabChange = useCallback(
        (value: number) => () => {
            setActiveTab(value)
            cache.write(() => {
                const activeHomePageTab =
                    cache.objectForPrimaryKey<ActiveHomePageTab>(
                        ActiveHomePageTab.getName(),
                        ActiveHomePageTab.getPrimaryKey(),
                    )

                if (activeHomePageTab) activeHomePageTab.activeIndex = value
            })
        },
        [cache],
    )

    const _renderItems = useMemo(() => {
        return entries.map(entry => {
            const isSelected = activeTab === entry.value
            return (
                <Pressable
                    key={entry.value}
                    onPress={onTabChange(entry.value)}
                    style={styles.button}>
                    <BaseText
                        typographyFont={
                            isSelected ? "subTitle" : "subTitleLight"
                        }>
                        {entry.label}
                    </BaseText>
                    {isSelected && (
                        <Animated.View
                            style={styles.underline}
                            entering={FadeIn.duration(200)}
                        />
                    )}
                </Pressable>
            )
        })
    }, [activeTab, onTabChange, styles.button, styles.underline])

    return (
        <BaseView align="center">
            <BaseView
                w={50}
                orientation="row"
                justify="space-between"
                align="center">
                {_renderItems}
            </BaseView>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underline: {
            height: 4,
            borderRadius: 10,
            backgroundColor: theme.colors.text,
            marginTop: 5,
            width: 20,
        },
        button: {
            paddingHorizontal: 10,
            paddingTop: 10,
            alignItems: "center",
            justifyContent: "center",
        },
    })
