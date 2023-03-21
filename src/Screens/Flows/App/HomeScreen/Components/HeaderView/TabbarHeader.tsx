import { Pressable, StyleSheet, View } from "react-native"
import React, { memo, useCallback } from "react"
import { BaseText, BaseView } from "~Components"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = {
    setActiveTab: React.Dispatch<React.SetStateAction<number>>
    activeTab: number
}

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
export const TabbarHeader: React.FC<Props> = memo(
    ({ activeTab, setActiveTab }) => {
        const { styles } = useThemedStyles(baseStyles)

        const onTabChange = useCallback(
            (value: number) => () => setActiveTab(value),
            [setActiveTab],
        )

        return (
            <BaseView alignItems="center">
                <BaseView
                    w={50}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center">
                    {entries.map(entry => {
                        const isSelected = activeTab === entry.value
                        return (
                            <Pressable
                                key={entry.value}
                                onPress={onTabChange(entry.value)}
                                style={styles.button}>
                                <BaseText
                                    typographyFont={
                                        isSelected
                                            ? "subTitle"
                                            : "subTitleLight"
                                    }>
                                    {entry.label}
                                </BaseText>
                                {isSelected && (
                                    <View style={styles.underline} />
                                )}
                            </Pressable>
                        )
                    })}
                </BaseView>
            </BaseView>
        )
    },
)

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
