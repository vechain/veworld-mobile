import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    DismissKeyboardView,
    Layout,
    SelectWatchedAccountBottomSheet,
    showErrorToast,
    useThor,
} from "~Components"
import { useI18nContext } from "~i18n"
import { selectAccounts, selectBalanceVisible, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Keyboard } from "react-native"
import { useBottomSheetModal, useCameraBottomSheet } from "~Hooks"
import HapticsService from "~Services/HapticsService"
import { AccountUtils, AddressUtils, BalanceUtils, BigNutils } from "~Utils"
import { ScanTarget, VET } from "~Constants"
import { Routes } from "~Navigation"
import { DEVICE_TYPE, WatchedAccount } from "~Model"

export const ObserveWalletScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const accounts = useAppSelector(selectAccounts)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const thor = useThor()

    const [address, setAddress] = useState("")
    const [error, setError] = useState<string | undefined>()
    const [_watchedAccount, setWatchedAccount] = useState<WatchedAccount | undefined>()
    const [formattedBalance, setFormattedBalance] = useState("0")

    const [btnTitle, setBtnTitle] = useState(LL.COMMON_IMPORT().toUpperCase())

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const findWalletOnChain = useCallback(
        async (_address: string) => {
            let accountIndex = 1

            for (const account of accounts) {
                if (AccountUtils.isObservedAccount(account)) {
                    accountIndex++
                }
            }

            const account: WatchedAccount = {
                address: _address,
                alias: `Wallet ${accountIndex}`,
                visible: true,
                type: DEVICE_TYPE.LOCAL_WATCHED,
                rootAddress: _address,
                index: -1,
            }

            // get balance
            const balance = await BalanceUtils.getBalanceFromBlockchain(VET.address, _address, selectedNetwork, thor)
            const _formattedBalance = BigNutils(balance?.balance).toHuman(VET.decimals).decimals(4).toString
            setFormattedBalance(_formattedBalance)

            setWatchedAccount(account)
            openSelectAccountBottomSheet()
        },
        [accounts, openSelectAccountBottomSheet, selectedNetwork, thor],
    )

    const handleConfirmAccount = useCallback(() => {
        setBtnTitle(LL.COMMON_BTN_CONFIRM().toUpperCase())
        // navigate to confirm watch wallet screen
        !!_watchedAccount && nav.navigate(Routes.OBSERVE_WALLET_CONFIRMATION, { account: _watchedAccount })
    }, [LL, _watchedAccount, nav])

    const onImport = useCallback(() => {
        // Try to close the keyboard. Might come in handy if the user is using the camera to scan a QR code
        Keyboard.dismiss()

        // check if wallet is already observed - imported - if so, show error message
        let isWalletAlreadyImported = false

        for (const account of accounts) {
            if (AddressUtils.compareAddresses(account.address, address)) {
                isWalletAlreadyImported = true
                break
            }
        }

        if (isWalletAlreadyImported) {
            showErrorToast({ text1: LL.ERROR_WALLET_ALREADY_EXISTS() })
        } else {
            // find wallet in the network and present the wallet details
            findWalletOnChain(address)
        }
    }, [LL, accounts, address, findWalletOnChain])

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan: onImport,
        targets: [ScanTarget.ADDRESS],
    })

    const handleOnSetAddress = useCallback(
        (value: string) => {
            setError(undefined)

            const addressIsValid = AddressUtils.isValid(value)

            if (!addressIsValid) {
                setError(LL.ERROR_INVALID_ADDRESS())
            }

            setAddress(value)
        },
        [LL],
    )

    const onClearAddress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        setAddress("")
        setError(undefined)
    }, [])

    const handleOnIconPress = useCallback(() => {
        Keyboard.dismiss()
        handleOpenCamera()
    }, [handleOpenCamera])

    return (
        <DismissKeyboardView>
            <Layout
                body={
                    <>
                        <BaseView justifyContent="space-between">
                            <BaseView>
                                <BaseView flexDirection="row" w={100}>
                                    <BaseText typographyFont="title">{LL.TITLE_OBSERVE_WALLET()}</BaseText>
                                </BaseView>
                                <BaseText typographyFont="body" my={10}>
                                    {LL.BD_OBSERVE_WALLET()}
                                </BaseText>

                                <BaseSpacer height={20} />

                                <BaseTextInput
                                    placeholder="0x..."
                                    label={LL.SEND_PLEASE_TYPE_ADDRESS()}
                                    errorMessage={error}
                                    setValue={handleOnSetAddress}
                                    value={address}
                                    autoFocus
                                    onIconPress={() => (address ? onClearAddress() : handleOnIconPress)}
                                    rightIcon={address ? "close" : "qrcode-scan"}
                                />

                                <BaseSpacer height={40} />
                            </BaseView>
                        </BaseView>

                        <SelectWatchedAccountBottomSheet
                            formattedBalance={formattedBalance}
                            closeBottomSheet={closeSelectAccountBottonSheet}
                            account={_watchedAccount}
                            confirmAccount={handleConfirmAccount}
                            isBalanceVisible={isBalanceVisible}
                            ref={selectAccountBottomSheetRef}
                        />
                    </>
                }
                footer={
                    <>
                        <BaseView w={100}>
                            <BaseButton
                                action={onImport}
                                disabled={!address || !!error}
                                w={100}
                                title={btnTitle}
                                disabledActionHaptics="Heavy"
                            />
                        </BaseView>

                        {RenderCameraModal}
                    </>
                }
            />
        </DismissKeyboardView>
    )
}
// AccountCard
