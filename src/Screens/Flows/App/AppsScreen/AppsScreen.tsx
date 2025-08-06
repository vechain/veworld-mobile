import React from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseView, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { VbdCarousel } from "./Components/Common/VbdCarousel/VbdCarousel"

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
                        {/* TODO: This is just a showcase. Implement it with real app ids from the needed hooks */}
                        <VbdCarousel
                            appIds={[
                                "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
                                "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
                                "0x54ac74eb150845171b72562f7d091cfbd3a20af91f21d26a2e9c5c97341c97c6",
                                "0x6a825c7d259075d70a88cbd1932604ee3009777e14645ced6881a32b9c165ca4",
                            ]}
                        />
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
