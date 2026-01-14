import * as Clipboard from "expo-clipboard"
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import Animated, { LinearTransition, ZoomInEasyUp, ZoomOutEasyUp } from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTextInput, BaseView } from "~Components/Base"
import { AlertInline } from "~Components/Reusable/Alert"
import { CreateContactBottomSheet } from "~Components/Reusable/BottomSheets"
import { COLORS, ColorThemeType, ScanTarget } from "~Constants"
import { useBottomSheetModal, useCameraBottomSheet, useThemedStyles, ZERO_ADDRESS } from "~Hooks"
import { ScanFunctionRegistry } from "~Hooks/useScanTargets"
import { useVns } from "~Hooks/useVns"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { selectAccounts, selectKnownContacts, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

type Props = {
    value?: string
    onAddressChange: (str: string, address: string) => void
    isError: boolean
    setIsError: Dispatch<SetStateAction<boolean>>
    address: string
}

export const WalletAddressCard = ({
    value,
    address,
    onAddressChange: _onAddressChange,
    isError,
    setIsError,
}: Props) => {
    const [isFocused, setIsFocused] = useState(false)

    const accounts = useAppSelector(selectAccounts)
    const knownContacts = useAppSelector(selectKnownContacts)

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { getVnsAddress } = useVns()
    const { ref: createContactBottomSheetRef, onOpen: openCreateContactSheet } = useBottomSheetModal()

    const handleScanAddress = useCallback<ScanFunctionRegistry["address"]>(
        async (_address: string) => {
            _onAddressChange(_address, _address)
            return true
        },
        [_onAddressChange],
    )

    const handleScanVns = useCallback<ScanFunctionRegistry["vns"]>(
        async (data, defaultFn) => {
            const res = await defaultFn(data)
            if (!res) {
                setIsError(true)
                return false
            }
            _onAddressChange(res.name, res.address)
            return true
        },
        [_onAddressChange, setIsError],
    )

    const { RenderCameraModal, handleOpenOnlyScanCamera } = useCameraBottomSheet({
        sourceScreen: Routes.SEND_TOKEN,
        targets: [ScanTarget.ADDRESS, ScanTarget.VNS],
        onScanAddress: handleScanAddress,
        onScanVns: handleScanVns,
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

    const handleClearAddress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        _onAddressChange("", "")
        setIsError(false)
    }, [_onAddressChange, setIsError])

    const handleFocus = useCallback(() => {
        setIsFocused(true)
    }, [setIsFocused])

    const handleBlur = useCallback(() => {
        setIsFocused(false)
    }, [])

    const handlePasteAddress = useCallback(async () => {
        let isString = await Clipboard.hasStringAsync()
        if (!isString) return
        const text = await Clipboard.getStringAsync().then(r => r.trim())
        if (!text.endsWith(".vet")) {
            _onAddressChange(text, text)
            setIsError(!AddressUtils.isValid(text))
            return
        }
        const addr = await getVnsAddress(text).catch(() => undefined)
        if (!addr) {
            _onAddressChange(text, "")
            setIsError(true)
            return
        }
        _onAddressChange(text, addr)
        setIsError(false)
    }, [_onAddressChange, getVnsAddress, setIsError])

    const computedInputStyles = useMemo(() => {
        const defaultBorderColor = theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200
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
                borderColor: isFocused ? theme.colors.textInputFocusedBorderColor : defaultBorderColor,
                borderWidth: isFocused ? 2 : 1,
            },
        ]
    }, [
        isFocused,
        theme.colors.textInputFocusedBorderColor,
        styles.inputContainer,
        isError,
        theme.colors.danger,
        theme.isDark,
    ])

    const onValueChange = useCallback(
        async (str: string) => {
            _onAddressChange(str, str)

            if (str.includes(".vet")) {
                const vnsAddress = await getVnsAddress(str).catch(() => ZERO_ADDRESS)

                if (vnsAddress === ZERO_ADDRESS || !vnsAddress) {
                    setIsError(true)
                    return
                }

                if (AddressUtils.isValid(vnsAddress)) {
                    _onAddressChange(str, vnsAddress!)
                    setIsError(false)
                }
            } else {
                if (!str) {
                    setIsError(false)
                    return
                }

                if (str.length === 42 && AddressUtils.isValid(str)) {
                    setIsError(false)
                } else {
                    setIsError(true)
                }
            }
        },
        [_onAddressChange, getVnsAddress, setIsError],
    )

    return (
        <>
            <Animated.View style={styles.root} layout={LinearTransition}>
                <Animated.View style={styles.inputWrapper}>
                    <BaseText typographyFont="captionSemiBold" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                        {LL.SEND_RECEIVER_ADDRESS_INPUT_LABEL()}
                    </BaseText>
                    <BaseView style={styles.actionsContainer}>
                        <BaseTextInput
                            testID="Send_Receiver_Address_Input"
                            placeholder={LL.SEND_RECEIVER_ADDRESS_INPUT_PLACEHOLDER()}
                            containerStyle={styles.input}
                            inputContainerStyle={computedInputStyles}
                            placeholderTextColor={COLORS.GREY_400}
                            value={value}
                            rightIconAdornment
                            autoComplete="off"
                            autoCapitalize="none"
                            autoCorrect={false}
                            rightIcon={value ? "icon-circle-x" : "icon-paste"}
                            rightIconColor={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                            rightIconSize={16}
                            rightIconTestID={
                                value
                                    ? "Send_Receiver_Address_Input_Clear_Button"
                                    : "Send_Receiver_Address_Input_Paste_Button"
                            }
                            onIconPress={value ? handleClearAddress : handlePasteAddress}
                            rightIconStyle={styles.rightIcon}
                            handleBlur={handleBlur}
                            handleFocus={handleFocus}
                            setValue={onValueChange}
                        />
                        <TouchableOpacity
                            testID="Send_Receiver_Address_Scan_Button"
                            style={styles.scanButton}
                            activeOpacity={0.85}
                            onPress={handleOpenOnlyScanCamera}>
                            <BaseIcon
                                name="icon-scan-line"
                                size={24}
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}
                            />
                        </TouchableOpacity>
                    </BaseView>
                </Animated.View>

                {isError && (
                    <Animated.View
                        testID="Send_Receiver_Address_Input_Error"
                        entering={ZoomInEasyUp}
                        exiting={ZoomOutEasyUp}>
                        <AlertInline message={LL.SEND_RECEIVER_ADDRESS_INPUT_ERROR()} status="error" variant="inline" />
                    </Animated.View>
                )}

                {shouldShowAddToContactsButton && (
                    <AnimatedTouchableOpacity
                        testID="Send_Receiver_Address_Add_To_Contacts_Button"
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
