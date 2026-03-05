import React, { useCallback, useMemo } from "react"
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, TouchableOpacity, View } from "react-native"
import Animated, {
    Extrapolation,
    interpolate,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated"
import { AccountIcon, Layout } from "~Components"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useCopyClipboard } from "~Hooks/useCopyClipboard"
import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"
import { useShareVeBetterCard } from "~Hooks/useShareVeBetterCard"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { VeBetterDaoActionGroup } from "../BalanceScreen/Components/VeBetterDao/VeBetterDaoActionGroup"
import { VeBetterDaoCard } from "../BalanceScreen/Components/VeBetterDao/VeBetterDaoCard"
import { NewUserVeBetterCard } from "../BalanceScreen/Components/VeBetterDao/NewUserVeBetterCard"
import { NonVotedProposalsList } from "./Components/NonVotedProposalsList"
import { VoteReminderCard } from "./Components/VoteReminderCard"

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

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { name: vnsName } = useVns({ name: "", address: selectedAccount.address })
    const { onCopyToClipboard } = useCopyClipboard()
    const { cardRef, shareCard, isSharing } = useShareVeBetterCard()
    const { data: isVeBetterUser } = useIsVeBetterUser()

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
                { translateY: interpolate(t, [0, 1], [-TOP_CENTER_Y, -travelY]) },
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
        const transitionDistance = HERO_HEIGHT - HEADER_HEIGHT
        const opacity = interpolate(scrollY.value, [1, transitionDistance], [1, 0], Extrapolation.CLAMP)
        return { opacity }
    })

    return (
        <Layout
            noBackButton
            noMargin
            fixedHeader={
                <View style={styles.header}>
                    <Animated.View style={titleAnimatedStyle}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}>
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
                        <Animated.View style={styles.blocksContainer}>
                            {isVeBetterUser ? (
                                <BaseView px={24}>
                                    <VoteReminderCard />
                                    <NonVotedProposalsList />
                                    <BaseSpacer height={40} />
                                    <VeBetterDaoCard ref={cardRef} />
                                    <VeBetterDaoActionGroup onShareCard={shareCard} isSharing={isSharing} />
                                </BaseView>
                            ) : (
                                <Animated.View layout={LinearTransition.duration(400)}>
                                    <NewUserVeBetterCard isClosable={false} />
                                    <BaseSpacer height={18} />
                                </Animated.View>
                            )}
                        </Animated.View>
                    </Animated.ScrollView>

                    <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
                        <AccountIcon account={selectedAccount} size={ICON_SIZE} />
                        <Animated.View style={[styles.profileInfoWrapper, addressAnimatedStyle]}>
                            <BaseText
                                typographyFont="subSubTitleSemiBold"
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}>
                                {vnsName || selectedAccount.alias}
                            </BaseText>
                            <TouchableOpacity
                                style={styles.addressContainer}
                                onPress={() =>
                                    onCopyToClipboard(selectedAccount.address, LL.COMMON_LBL_ADDRESS(), {
                                        icon: "icon-wallet",
                                        showNotification: true,
                                    })
                                }>
                                <BaseText
                                    typographyFont="captionMedium"
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                                    {AddressUtils.humanAddress(selectedAccount.address, 6, 4)}
                                </BaseText>
                                <BaseIcon
                                    name="icon-copy"
                                    size={16}
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </View>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: { flex: 1 },
        header: {
            height: HEADER_HEIGHT,
            justifyContent: "center",
            paddingLeft: LEFT_PADDING + STICKY_ICON_SIZE + 12, // leave room for sticky icon on left
        },
        scrollContent: {
            paddingBottom: 24,
        },
        heroSpacer: {
            height: HERO_HEIGHT,
            backgroundColor: theme.colors.background,
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
        addressContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        blocksContainer: {
            // backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.PURPLE_LABEL,
            // borderTopLeftRadius: 24,
            // borderTopRightRadius: 24,
            paddingTop: 24,
            gap: 12,
        },
        block: {
            height: 200,
            borderRadius: 12,
            marginBottom: 12,
            backgroundColor: "#222",
        },
    })
