import React, { useCallback, useMemo } from "react"
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native"
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { AccountIcon, BaseText, Layout } from "~Components"
import { useVns } from "~Hooks"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

const HEADER_HEIGHT = 56
const HERO_HEIGHT = 180
const ICON_SIZE = 72
const STICKY_ICON_SIZE = 32
const LEFT_PADDING = 24
const TOP_CENTER_Y = 24
const TITLE_FADE_DELAY_RATIO = 0.65

export const ProfileScreen = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { name: vnsName } = useVns({ name: "", address: selectedAccount.address })

    const scrollY = useSharedValue(0)

    const headerUsername = useMemo(() => {
        if (!vnsName) {
            //Name has not been changed, humanize address
            if (/^Account \d+$/.test(selectedAccount.alias)) return AddressUtils.humanAddress(selectedAccount.address)
            return selectedAccount.alias
        }
        if (vnsName.endsWith(".veworld.vet")) return vnsName.split(".veworld.vet")[0]
        return vnsName
    }, [selectedAccount.address, selectedAccount.alias, vnsName])

    const onScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollY.value = e.nativeEvent.contentOffset.y
        },
        [scrollY],
    )

    const iconAnimatedStyle = useAnimatedStyle(() => {
        const t = interpolate(scrollY.value, [0, HERO_HEIGHT - HEADER_HEIGHT], [0, 1], Extrapolation.CLAMP)

        const travelX = SCREEN_WIDTH / 2 - LEFT_PADDING - STICKY_ICON_SIZE / 2
        // Move icon center to header center, then scale down to sticky size.
        const travelY = TOP_CENTER_Y + ICON_SIZE / 2 + HEADER_HEIGHT / 2
        const scale = STICKY_ICON_SIZE / ICON_SIZE

        return {
            transform: [
                { translateX: interpolate(t, [0, 1], [0, -travelX]) },
                { translateY: interpolate(t, [0, 1], [0, -travelY]) },
                { scale: interpolate(t, [0, 1], [1, scale]) },
            ],
        }
    })

    const titleAnimatedStyle = useAnimatedStyle(() => {
        const transitionDistance = HERO_HEIGHT - HEADER_HEIGHT
        const fadeStart = transitionDistance * TITLE_FADE_DELAY_RATIO
        const opacity = interpolate(scrollY.value, [fadeStart, transitionDistance], [0, 1], Extrapolation.CLAMP)
        return { opacity }
    })

    const addressAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 24], [1, 0], Extrapolation.CLAMP)
        return { opacity }
    })

    return (
        <Layout
            noBackButton
            noMargin
            fixedHeader={
                <View style={styles.header}>
                    <Animated.View style={titleAnimatedStyle}>
                        <BaseText typographyFont="captionSemiBold" color="white">
                            {headerUsername}
                        </BaseText>
                    </Animated.View>
                </View>
            }
            fixedBody={
                <View style={styles.container}>
                    <Animated.ScrollView
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}>
                        <View style={styles.heroSpacer} />
                        <View style={styles.block} />
                        <View style={styles.block} />
                        <View style={styles.block} />
                        <View style={styles.block} />
                        <View style={styles.block} />
                        <View style={styles.block} />
                    </Animated.ScrollView>

                    <Animated.View pointerEvents="none" style={[styles.iconWrapper, iconAnimatedStyle]}>
                        <AccountIcon account={selectedAccount} size={ICON_SIZE} />
                        <Animated.View style={[styles.profileInfoWrapper, addressAnimatedStyle]}>
                            <BaseText typographyFont="bodyMedium" color="white">
                                {vnsName || selectedAccount.alias}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" color="white">
                                {AddressUtils.humanAddress(selectedAccount.address)}
                            </BaseText>
                        </Animated.View>
                    </Animated.View>
                </View>
            }
        />
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: HEADER_HEIGHT,
        justifyContent: "center",
        paddingLeft: LEFT_PADDING + STICKY_ICON_SIZE + 12, // leave room for sticky icon on left
    },
    scrollContent: {
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    heroSpacer: {
        height: HERO_HEIGHT,
    },
    iconWrapper: {
        position: "absolute",
        top: TOP_CENTER_Y,
        left: SCREEN_WIDTH / 2 - ICON_SIZE / 2,
        zIndex: 10,
        width: ICON_SIZE,
    },
    profileInfoWrapper: {
        position: "absolute",
        top: ICON_SIZE + 12,
        left: -(SCREEN_WIDTH / 2 - ICON_SIZE / 2),
        width: SCREEN_WIDTH,
        gap: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    block: {
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#222",
    },
})
