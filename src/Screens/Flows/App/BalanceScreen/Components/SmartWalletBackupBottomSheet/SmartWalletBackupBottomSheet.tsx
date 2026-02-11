import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import React, { useCallback, useEffect, useMemo } from "react"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useSmartWallet } from "~Hooks"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model/Wallet"
import { Routes } from "~Navigation"
import { setDeviceIsBackup, setLastBackupRequestTimestamp } from "~Storage/Redux"
import { useAppDispatch, useAppSelector } from "~Storage/Redux/Hooks"
import { selectLastBackupRequestTimestamp, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { PlatformUtils } from "~Utils"

export const SmartWalletBackupBottomSheet = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const lastBackupRequestTimestamp = useAppSelector(selectLastBackupRequestTimestamp)

    const { ref, onOpen, onClose } = useBottomSheetModal()
    const { hasMultipleSocials, isLoading, isAuthenticated } = useSmartWallet()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()

    const isSmartWallet = useMemo(
        () => selectedAccount.device?.type === DEVICE_TYPE.SMART_WALLET,
        [selectedAccount.device?.type],
    )

    const isBackedUp = useMemo(
        () => selectedAccount.device?.isBuckedUp && selectedAccount.device?.lastBackupDate,
        [selectedAccount.device?.isBuckedUp, selectedAccount.device?.lastBackupDate],
    )

    const onLinkPress = useCallback(() => {
        onClose()
        nav.navigate("SettingsStack", { screen: Routes.SETTINGS, initial: true })
        nav.navigate("SettingsStack", { screen: Routes.SETTINGS_PRIVACY, initial: false })
    }, [onClose, nav])

    const mainButton = useMemo(() => {
        return <BaseButton w={100} title={LL.SMART_WALLET_LINK_MODAL_BUTTON()} action={onLinkPress} />
    }, [LL, onLinkPress])

    const onLaterPress = useCallback(() => {
        onClose()
        dispatch(
            setLastBackupRequestTimestamp({
                address: selectedAccount.device?.rootAddress ?? "",
                timestamp: moment().unix(),
            }),
        )
    }, [onClose, dispatch, selectedAccount.device?.rootAddress])

    const secondaryButton = useMemo(() => {
        return <BaseButton w={100} title={LL.BTN_ILL_DO_IT_LATER()} variant="outline" action={onLaterPress} />
    }, [LL, onLaterPress])

    useEffect(() => {
        if (!isSmartWallet || PlatformUtils.isAndroid()) {
            return
        }

        if (isBackedUp) {
            return
        }

        const address = selectedAccount.device?.rootAddress ?? ""
        const now = moment()

        if (hasMultipleSocials && !isLoading && isAuthenticated) {
            dispatch(
                setDeviceIsBackup({
                    rootAddress: address,
                    isBackup: true,
                    isBackupManual: false,
                    date: now.format(),
                }),
            )
            return
        }

        const timeStamp = lastBackupRequestTimestamp?.[address]

        if (!timeStamp) {
            dispatch(
                setLastBackupRequestTimestamp({
                    address,
                    timestamp: now.unix(),
                }),
            )
            onOpen()
            return
        }

        const lastRequest = moment.unix(timeStamp)
        const shouldOpen = now.diff(lastRequest, "weeks") >= 1

        if (shouldOpen) {
            dispatch(
                setLastBackupRequestTimestamp({
                    address,
                    timestamp: now.unix(),
                }),
            )
            onOpen()
        }
    }, [
        isSmartWallet,
        hasMultipleSocials,
        isBackedUp,
        dispatch,
        selectedAccount.device?.rootAddress,
        selectedAccount.device?.type,
        isLoading,
        isAuthenticated,
        lastBackupRequestTimestamp,
        onOpen,
    ])

    return (
        <DefaultBottomSheet
            ref={ref}
            scrollable={false}
            icon="icon-shield-alert"
            title={LL.SMART_WALLET_LINK_MODAL_TITLE()}
            description={LL.SMART_WALLET_LINK_MODAL_SUBTITLE()}
            mainButton={mainButton}
            secondaryButton={secondaryButton}
        />
    )
}
