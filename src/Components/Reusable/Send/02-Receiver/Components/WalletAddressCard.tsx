import * as Clipboard from "expo-clipboard"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Keyboard, Pressable, StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import Animated, { LinearTransition, ZoomInEasyUp, ZoomOutEasyUp } from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTextInput, BaseView } from "~Components/Base"
import { AlertInline } from "~Components/Reusable/Alert"
import { CreateContactBottomSheet } from "~Components/Reusable/BottomSheets"
import { COLORS, ColorThemeType, ScanTarget } from "~Constants"
import { useBottomSheetModal, useCameraBottomSheet, useThemedStyles, useVns, ZERO_ADDRESS } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { selectAccounts, selectKnownContacts, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export const WalletAddressCard = () => {
    const [address, setAddress] = useState("")
    const [isError, setIsError] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const accounts = useAppSelector(selectAccounts)
    const knownContacts = useAppSelector(selectKnownContacts)

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { getVnsAddress } = useVns()
    const { ref: createContactBottomSheetRef, onOpen: openCreateContactSheet } = useBottomSheetModal()

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        sourceScreen: Routes.SEND_TOKEN,
        targets: [ScanTarget.ADDRESS],
        onScanAddress: data => {
            setAddress(data)
            return Promise.resolve(true)
        },
    })

    const isAddressInContactsOrAccounts = useMemo(() => {
        if (!address || !AddressUtils.isValid(address) || isError) return false
        return (
            knownContacts.some(contact => AddressUtils.compareAddresses(contact.address, address)) ||
            accounts.some(account => AddressUtils.compareAddresses(account.address, address))
        )
    }, [knownContacts, accounts, address, isError])

    const shouldShowAddToContactsButton = useMemo(() => {
        return !isAddressInContactsOrAccounts && !!address && !isError
    }, [isAddressInContactsOrAccounts, address, isError])

    const handlePasteAddress = useCallback(async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let text = await Clipboard.getStringAsync()
            setAddress(text)
        }
    }, [])

    const handleClearAddress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        setAddress("")
        setIsError(false)
    }, [setAddress])

    const handleFocus = useCallback(() => {
        setIsFocused(true)
    }, [setIsFocused])

    const handleBlur = useCallback(() => {
        setIsFocused(false)
    }, [])

    const handleOpenScanCamera = useCallback(() => {
        handleOpenCamera({ tabs: ["scan"], defaultTab: "scan" })
    }, [handleOpenCamera])

    const renderInputActions = useMemo(() => {
        if (address && address.length > 0) {
            return (
                <Pressable onPress={handleClearAddress}>
                    <BaseText numberOfLines={1} typographyFont="captionSemiBold">
                        {LL.SEND_RECEIVER_ADDRESS_INPUT_CLEAR()}
                    </BaseText>
                </Pressable>
            )
        }

        return (
            <Pressable onPress={handlePasteAddress}>
                <BaseText numberOfLines={1} typographyFont="captionSemiBold">
                    {LL.SEND_RECEIVER_ADDRESS_INPUT_PASTE()}
                </BaseText>
            </Pressable>
        )
    }, [address, handleClearAddress, handlePasteAddress, LL])

    useEffect(() => {
        const init = async () => {
            if (address && address.includes(".vet")) {
                const vnsAddress = await getVnsAddress(address)

                if (vnsAddress === ZERO_ADDRESS) {
                    setIsError(true)
                    return
                }

                if (AddressUtils.isValid(vnsAddress)) {
                    setAddress(vnsAddress ?? "")
                    Keyboard.dismiss()
                }
            } else {
                if (!address) {
                    setIsError(false)
                    return
                }

                if (address.length === 42 && AddressUtils.isValid(address)) {
                    setAddress(address)
                    Keyboard.dismiss()
                } else {
                    setIsError(true)
                }
            }
        }
        init()
    }, [getVnsAddress, address])

    const computedInputStyles = useMemo(() => {
        if (isError) {
            return [
                styles.inputContainer,
                {
                    borderColor: theme.colors.danger,
                    borderWidth: 2,
                },
            ]
        }

        return [
            styles.inputContainer,
            {
                borderColor: isFocused ? theme.colors.textInputFocusedBorderColor : theme.colors.cardBorder,
                borderWidth: isFocused ? 2 : 1,
            },
        ]
    }, [
        isFocused,
        theme.colors.textInputFocusedBorderColor,
        theme.colors.cardBorder,
        styles.inputContainer,
        isError,
        theme.colors.danger,
    ])

    return (
        <>
            <Animated.View style={styles.root} layout={LinearTransition}>
                <Animated.View style={styles.inputWrapper}>
                    <BaseText typographyFont="captionSemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_700}>
                        {LL.SEND_RECEIVER_ADDRESS_INPUT_LABEL()}
                    </BaseText>
                    <BaseView style={styles.actionsContainer}>
                        <BaseTextInput
                            placeholder={LL.SEND_RECEIVER_ADDRESS_INPUT_PLACEHOLDER()}
                            containerStyle={styles.input}
                            inputContainerStyle={computedInputStyles}
                            placeholderTextColor={COLORS.GREY_400}
                            value={address}
                            setValue={setAddress}
                            rightIconAdornment
                            autoComplete="off"
                            autoCapitalize="none"
                            autoCorrect={false}
                            rightIcon={renderInputActions}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                        />
                        <TouchableOpacity style={styles.scanButton} activeOpacity={0.85} onPress={handleOpenScanCamera}>
                            <BaseIcon
                                name="icon-scan-line"
                                size={24}
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            />
                        </TouchableOpacity>
                    </BaseView>
                </Animated.View>

                {isError && (
                    <Animated.View entering={ZoomInEasyUp} exiting={ZoomOutEasyUp}>
                        <AlertInline message={LL.SEND_RECEIVER_ADDRESS_INPUT_ERROR()} status="error" variant="inline" />
                    </Animated.View>
                )}

                {shouldShowAddToContactsButton && (
                    <AnimatedTouchableOpacity
                        entering={ZoomInEasyUp}
                        exiting={ZoomOutEasyUp}
                        style={styles.addToContactsButton}
                        onPress={() => openCreateContactSheet({ address })}>
                        <BaseIcon
                            name="icon-plus-circle"
                            size={16}
                            color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                        />
                        <BaseText typographyFont="caption" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}>
                            {LL.SEND_RECEIVER_ADD_CONTACT_BTN()}
                        </BaseText>
                    </AnimatedTouchableOpacity>
                )}
            </Animated.View>

            {RenderCameraModal}

            <CreateContactBottomSheet bsRef={createContactBottomSheetRef} />
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderRadius: 16,
            padding: 24,
            gap: 16,
        },
        inputWrapper: {
            flexDirection: "column",
            gap: 12,
        },
        title: {
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_100,
        },
        actionsContainer: {
            flexDirection: "row",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        inputContainer: {
            flex: 1,
            borderColor: theme.colors.cardBorder,
            borderWidth: 1,
        },
        input: {
            flex: 1,
            height: "auto",
        },
        scanButton: {
            borderRadius: 8,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            borderWidth: 1,
            padding: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        addToContactsButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 8,
        },
    })
