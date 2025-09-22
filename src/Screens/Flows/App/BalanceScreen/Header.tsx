import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { RefObject, useCallback, useMemo } from "react"
import { LayoutChangeEvent, StyleSheet, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { clamp, interpolate, SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { AccountIcon, BaseIcon, BaseText, BaseView, SelectAccountBottomSheet } from "~Components"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useBottomSheetModal, useSetSelectedAccount, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { Routes } from "~Navigation"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

type Props = {
    scrollY: SharedValue<number>
    contentOffsetY: SharedValue<number>
    qrCodeBottomSheetRef: RefObject<BottomSheetModalMethods>
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export const Header = ({ scrollY, contentOffsetY, qrCodeBottomSheetRef }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const account = useAppSelector(selectSelectedAccount)

    const nav = useNavigation()

    const height = useSharedValue(90)

    const onWalletManagementPress = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const gradientStyle = useAnimatedStyle(() => {
        return {
            height: height.value * 2,
            transform: [
                {
                    translateY: -clamp(
                        interpolate(scrollY.value, [0, contentOffsetY.value - height.value], [0, height.value * 0.58]),
                        0,
                        height.value,
                    ),
                },
            ],
        }
    }, [scrollY.value, contentOffsetY.value])

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            height.value = e.nativeEvent.layout.height
        },
        [height],
    )

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { onOpen: openQRCodeSheet } = useBottomSheetModal({ externalRef: qrCodeBottomSheetRef })

    const handleOpenQRCode = useCallback(() => openQRCodeSheet(), [openQRCodeSheet])
    const handleOpenWalletSwitcher = useCallback(() => openSelectAccountBottomSheet(), [openSelectAccountBottomSheet])

    const accounts = useAppSelector(selectVisibleAccounts)
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { name: vnsName } = useVns({
        address: account.address,
        name: "",
    })

    const setSelectedAccount = useCallback(
        (_account: AccountWithDevice | WatchedAccount) => {
            onSetSelectedAccount({ address: _account.address })
        },
        [onSetSelectedAccount],
    )

    const isObservedAccount = useMemo(() => {
        return AccountUtils.isObservedAccount(account)
    }, [account])

    const displayUsername = useMemo(() => {
        if (!vnsName) return account.alias
        if (vnsName.endsWith(".veworld.vet")) return vnsName.split(".veworld.vet")[0]
        return vnsName
    }, [account.alias, vnsName])

    return (
        <BaseView style={styles.root} onLayout={onLayout}>
            {!isObservedAccount && (
                <AnimatedLinearGradient
                    colors={[COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.50)", "#423483"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.65, 1]}
                    angle={180}
                    useAngle
                    style={[gradientStyle, styles.gradient]}
                />
            )}

            <TouchableOpacity onPress={handleOpenWalletSwitcher}>
                <BaseView flexDirection="row" gap={12} py={4} px={8} borderRadius={99} style={styles.account}>
                    <AccountIcon address={account.address} size={32} borderRadius={100} />
                    <BaseText
                        typographyFont="captionSemiBold"
                        color={COLORS.PURPLE_LABEL}
                        numberOfLines={1}
                        flexDirection="row">
                        {displayUsername}
                    </BaseText>
                </BaseView>
            </TouchableOpacity>

            <BaseView flexDirection="row" gap={12}>
                {isObservedAccount ? (
                    <BaseView borderRadius={99} p={8} gap={8} flexDirection="row">
                        <BaseText color={COLORS.DARK_PURPLE_DISABLED} typographyFont="captionMedium">
                            {LL.VIEW_ONLY()}
                        </BaseText>
                        <BaseIcon name="icon-eye" color={COLORS.DARK_PURPLE_DISABLED} size={16} />
                    </BaseView>
                ) : (
                    <TouchableOpacity onPress={onWalletManagementPress}>
                        <BaseView borderRadius={99} p={8} gap={8} flexDirection="row">
                            <BaseIcon name="icon-wallet" color={COLORS.PURPLE_LABEL} size={24} />
                        </BaseView>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleOpenQRCode}>
                    <BaseView borderRadius={99} p={8}>
                        <BaseIcon name="icon-scanQR" color={COLORS.PURPLE_LABEL} size={24} />
                    </BaseView>
                </TouchableOpacity>
            </BaseView>

            <SelectAccountBottomSheet
                closeBottomSheet={closeSelectAccountBottonSheet}
                accounts={accounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={account}
                ref={selectAccountBottomSheetRef}
                goToWalletEnabled
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: "row",
            paddingTop: 8,
            paddingHorizontal: 16,
            paddingBottom: 16,
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
        },
        gradient: {
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "bottom",
            width: SCREEN_WIDTH,
            zIndex: -1,
        },
        account: {
            maxWidth: 140,
        },
    })
