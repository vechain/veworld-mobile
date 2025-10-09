import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
import { Keyboard } from "react-native"
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
} from "~Components"
import { ScanTarget } from "~Constants"
import { useBottomSheetModal, useCameraBottomSheet, useVns, ZERO_ADDRESS } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, WatchedAccount } from "~Model"
import HapticsService from "~Services/HapticsService"
import { addAccount, selectAccounts, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { AccountUtils, AddressUtils } from "~Utils"

export const ObserveWalletScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()

    const accounts = useAppSelector(selectAccounts)

    const [inputValue, setInputValue] = useState("")
    const [underlyingAddress, setUnderlyingAddress] = useState("")
    const { getVnsName, getVnsAddress, isLoading } = useVns()

    const [error, setError] = useState<string | undefined>()
    const [_watchedAccount, setWatchedAccount] = useState<WatchedAccount | undefined>()

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

            setWatchedAccount(account)
            openSelectAccountBottomSheet()
        },
        [accounts, openSelectAccountBottomSheet],
    )

    const handleConfirmAccount = useCallback(() => {
        setBtnTitle(LL.COMMON_BTN_CONFIRM().toUpperCase())

        !!_watchedAccount && dispatch(addAccount(_watchedAccount))

        nav.goBack()
    }, [LL, _watchedAccount, dispatch, nav])

    const onImport = useCallback(
        async (_address?: string) => {
            // Try to close the keyboard. Might come in handy if the user is using the camera to scan a QR code
            Keyboard.dismiss()

            const addressIsValid = AddressUtils.isValid(_address ?? underlyingAddress)
            if (!addressIsValid) {
                showErrorToast({ text1: LL.ERROR_INVALID_ADDRESS() })
                return false
            }

            // check if wallet is already observed - imported - if so, show error message
            let isWalletAlreadyImported = false

            for (const account of accounts) {
                if (AddressUtils.compareAddresses(account.address, _address ?? underlyingAddress)) {
                    isWalletAlreadyImported = true
                    break
                }
            }

            if (isWalletAlreadyImported) {
                showErrorToast({ text1: LL.ERROR_WALLET_ALREADY_EXISTS() })
                return false
            }
            // find wallet in the network and present the wallet details
            findWalletOnChain(_address ?? underlyingAddress)
            return true
        },
        [LL, accounts, underlyingAddress, findWalletOnChain],
    )

    const { RenderCameraModal, handleOpenOnlyScanCamera } = useCameraBottomSheet({
        onScanAddress: onImport,
        targets: [ScanTarget.ADDRESS],
    })

    const handleOnSetAddress = useCallback(
        async (value: string) => {
            setUnderlyingAddress("")
            setError(undefined)

            setInputValue(value)

            if (value.includes(".vet")) {
                const address = await getVnsAddress(value)

                if (address === ZERO_ADDRESS) {
                    setError(LL.ERROR_COULD_NOT_FIND_ADDRESS_FOR_DOMAIN())
                    return
                }

                setUnderlyingAddress(address ?? "")
                return
            }

            if (value.length === 42) {
                const [{ name }] = await getVnsName(value)
                setUnderlyingAddress(value)
                setInputValue(name || value)
            }
        },
        [LL, getVnsAddress, getVnsName],
    )

    const onClearAddress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        setInputValue("")
        setUnderlyingAddress("")
        setError(undefined)
    }, [])

    return (
        <DismissKeyboardView>
            <Layout
                safeAreaTestID="Observe_Wallet_Screen"
                title={LL.TITLE_OBSERVE_WALLET()}
                body={
                    <>
                        <BaseView justifyContent="space-between">
                            <BaseText typographyFont="body" my={10}>
                                {LL.BD_OBSERVE_WALLET()}
                            </BaseText>

                            <BaseSpacer height={20} />

                            <BaseTextInput
                                testID="observe-wallet-address-input"
                                placeholder="0x..."
                                label={LL.SEND_PLEASE_TYPE_ADDRESS()}
                                errorMessage={error}
                                setValue={handleOnSetAddress}
                                value={inputValue}
                                autoFocus
                                onIconPress={() => (inputValue ? onClearAddress() : handleOpenOnlyScanCamera())}
                                rightIcon={inputValue ? "icon-x" : "icon-qr-code"}
                            />

                            <BaseSpacer height={40} />
                        </BaseView>

                        <SelectWatchedAccountBottomSheet
                            closeBottomSheet={closeSelectAccountBottonSheet}
                            account={_watchedAccount}
                            confirmAccount={handleConfirmAccount}
                            ref={selectAccountBottomSheetRef}
                        />
                    </>
                }
                footer={
                    <>
                        <BaseView w={100}>
                            <BaseButton
                                isLoading={isLoading}
                                testID="observe-wallet-confirm-button"
                                action={onImport}
                                disabled={!underlyingAddress || !!error}
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
