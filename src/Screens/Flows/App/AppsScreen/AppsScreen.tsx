import React from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseView, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { EcosystemSection } from "./Components/Ecosystem"

export const AppsScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <Layout
            title="Apps"
            hasTopSafeAreaOnly
            noBackButton
            fixedBody={
                <BaseView flex={1} gap={16}>
                    <ScrollView style={styles.scrollView}>
                        <EcosystemSection />
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
