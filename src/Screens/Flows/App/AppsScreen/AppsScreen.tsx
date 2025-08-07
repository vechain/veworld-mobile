import React from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { ForYouCarousel } from "./Components/ForYouCarousel/ForYouCarousel"
import { NewUserForYouCarousel } from "./Components/ForYouCarousel/NewUserForYouCarousel"

const FOR_YOU_ACTIVE = true

export const AppsScreen = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <Layout
            title="Apps"
            hasSafeArea
            noBackButton
            bg={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
            fixedBody={
                <BaseView flex={1} gap={16}>
                    <ScrollView style={styles.scrollView}>
                        <NewUserForYouCarousel />
                        {FOR_YOU_ACTIVE && <ForYouCarousel />}
                        <BaseSpacer height={128} />
                    </ScrollView>
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        scrollView: {
            flex: 1,
        },
    })
