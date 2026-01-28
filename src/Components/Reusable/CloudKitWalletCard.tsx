import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { getTimeZone } from "react-native-localize"
import Animated, { interpolateColor, useAnimatedStyle, withTiming, ZoomIn, ZoomOut } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, DerivationPath } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CloudKitWallet } from "~Model"
import { selectDevices, useAppSelector } from "~Storage/Redux"
import { AddressUtils, DateUtils, PlatformUtils } from "~Utils"

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export const CloudKitWalletCard = ({
    wallet,
    selected,
    onPress,
}: {
    wallet: CloudKitWallet
    selected: CloudKitWallet | null
    onPress: () => void
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { getVnsName } = useVns()
    const { locale } = useI18nContext()
    const devices = useAppSelector(selectDevices)
    const [isImported, setisImported] = useState(false)

    useEffect(() => {
        devices.forEach(device => {
            if (device.rootAddress === wallet.rootAddress) {
                setisImported(true)
            }
        })
    }, [devices, wallet.rootAddress])

    const [nameOrAddress, setNameOrAddress] = useState(wallet.firstAccountAddress)
    useEffect(() => {
        const init = async () => {
            const [{ name: vnsName }] = await getVnsName(wallet.firstAccountAddress)
            if (vnsName) {
                setNameOrAddress(vnsName ?? "")
            } else {
                setNameOrAddress(AddressUtils.humanAddress(wallet.firstAccountAddress))
            }
        }
        init()
    }, [getVnsName, wallet.firstAccountAddress])

    const [creationDate, setCreationDate] = useState("...")
    useEffect(() => {
        const date = DateUtils.formatDateTime(
            Number(wallet.creationDate.toFixed(0)) * 1000,
            locale,
            getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
        )
        setCreationDate(date)
    }, [locale, wallet.creationDate])

    const isSelected = useMemo(
        () => AddressUtils.compareAddresses(selected?.rootAddress, wallet.rootAddress),
        [selected?.rootAddress, wallet.rootAddress],
    )
    const containerAnimatedStyles = useAnimatedStyle(() => {
        const selectedBorderColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        const unselectedBorderColor = theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_200

        return {
            borderWidth: withTiming(isSelected ? 2 : 1, { duration: 300 }),
            borderColor: interpolateColor(isSelected ? 1 : 0, [0, 1], [unselectedBorderColor, selectedBorderColor]),
        }
    }, [isSelected, theme.isDark])

    return (
        <AnimatedTouchableOpacity
            activeOpacity={0.9}
            disabled={isImported}
            style={[styles.container, isImported && styles.importedContainer, containerAnimatedStyles]}
            onPress={onPress}>
            <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                <BaseView flexDirection="column" flex={1}>
                    <BaseView justifyContent="space-between">
                        <BaseView flexDirection="row">
                            <BaseView alignSelf="flex-start" alignItems="flex-start">
                                <BaseView flexDirection="row" style={styles.icloudTag} alignItems="center" gap={8}>
                                    <BaseIcon
                                        size={14}
                                        name={PlatformUtils.isIOS() ? "icon-apple" : "icon-google-drive"}
                                        color={theme.isDark ? COLORS.GREY_100 : COLORS.PURPLE}
                                    />
                                    <BaseText
                                        typographyFont="captionMedium"
                                        color={theme.isDark ? COLORS.GREY_100 : COLORS.PURPLE}>
                                        {PlatformUtils.isIOS() ? "iCloud" : "Google Drive"}
                                    </BaseText>
                                </BaseView>
                            </BaseView>

                            {wallet.derivationPath === DerivationPath.ETH && (
                                <>
                                    <BaseSpacer width={4} />
                                    <BaseIcon name="icon-ethereum" size={20} color={theme.colors.primaryDisabled} />
                                </>
                            )}
                        </BaseView>

                        <BaseSpacer height={16} />

                        <BaseText typographyFont="bodySemiBold">{nameOrAddress}</BaseText>
                        <BaseSpacer height={8} />
                        <BaseText
                            typographyFont="captionRegular"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                            {creationDate}
                        </BaseText>
                    </BaseView>
                </BaseView>
                {isSelected && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.selectedIcon}>
                        <BaseIcon
                            name="icon-check"
                            size={16}
                            color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                        />
                    </Animated.View>
                )}
            </BaseView>
        </AnimatedTouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            borderWidth: 1,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            padding: 16,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_200,
            borderRadius: 16,
        },
        importedContainer: {
            opacity: 0.5,
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.border,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        icloudTag: {
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_200,
        },
        selectedIcon: {
            alignSelf: "flex-start",
        },
    })
