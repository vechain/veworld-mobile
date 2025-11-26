import React from "react"
import { WalletAddressCard } from "./Components/WalletAddressCard"

import { useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { KnownAddressesList } from "./Components/KnownAddressesList"

export const ReceiverScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <Animated.View style={styles.root}>
            <WalletAddressCard />
            <KnownAddressesList />
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: "column",
            gap: 8,
        },
    })
