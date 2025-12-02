import * as Clipboard from "expo-clipboard"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
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

type Props = {
    selectedAddress?: string
    onAddressChange: (address: string) => void
}

export const WalletAddressCard = ({ selectedAddress, onAddressChange }: Props) => {
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
            onAddressChange(data)
            return Promise.resolve(true)
        },
    })

    const isAddressInContactsOrAccounts = useMemo(() => {
        if (!selectedAddress || !AddressUtils.isValid(selectedAddress) || isError) return false
        return (
            knownContacts.some(contact => AddressUtils.compareAddresses(contact.address, selectedAddress)) ||
            accounts.some(account => AddressUtils.compareAddresses(account.address, selectedAddress))
        )
    }, [knownContacts, accounts, selectedAddress, isError])

    const shouldShowAddToContactsButton = useMemo(() => {
        return !isAddressInContactsOrAccounts && !!selectedAddress && !isError
    }, [isAddressInContactsOrAccounts, selectedAddress, isError])

    const handlePasteAddress = useCallback(async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let text = await Clipboard.getStringAsync()
            onAddressChange(text)
        }
    }, [onAddressChange])

    const handleClearAddress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        onAddressChange("")
        setIsError(false)
    }, [onAddressChange])

    const handleFocus = useCallback(() => {
        setIsFocused(true)
    }, [setIsFocused])

    const handleBlur = useCallback(() => {
        setIsFocused(false)
    }, [])

    const handleOpenScanCamera = useCallback(() => {
        handleOpenCamera({ tabs: ["scan"], defaultTab: "scan" })
    }, [handleOpenCamera])

    useEffect(() => {
        const init = async () => {
            if (selectedAddress && selectedAddress.includes(".vet")) {
                const vnsAddress = await getVnsAddress(selectedAddress)

                if (vnsAddress === ZERO_ADDRESS) {
                    setIsError(true)
                    return
                }

                if (AddressUtils.isValid(vnsAddress)) {
                    Keyboard.dismiss()
                }
            } else {
                if (!selectedAddress) {
                    setIsError(false)
                    return
                }

                if (selectedAddress.length === 42 && AddressUtils.isValid(selectedAddress)) {
                    Keyboard.dismiss()
                } else {
                    setIsError(true)
                }
            }
        }
        init()
    }, [getVnsAddress, selectedAddress, isError])

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
                            value={selectedAddress}
                            setValue={onAddressChange}
                            rightIconAdornment
                            autoComplete="off"
                            autoCapitalize="none"
                            autoCorrect={false}
                            rightIcon={!selectedAddress ? "icon-copy" : "icon-circle-x"}
                            rightIconSize={16}
                            onIconPress={!selectedAddress ? handlePasteAddress : handleClearAddress}
                            rightIconStyle={styles.rightIcon}
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
                        onPress={() => openCreateContactSheet({ address: selectedAddress })}>
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
        rightIcon: {
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600,
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
