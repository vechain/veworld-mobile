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
import {
    addAccount,
    selectAccounts,
    selectBalanceVisible,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Keyboard } from "react-native"
import { useBottomSheetModal, useCameraBottomSheet, useVns, ZERO_ADDRESS } from "~Hooks"
import HapticsService from "~Services/HapticsService"
import { AccountUtils, AddressUtils, BalanceUtils, BigNutils } from "~Utils"
import { ScanTarget, VET } from "~Constants"
import { DEVICE_TYPE, WatchedAccount } from "~Model"

export const ObserveWalletScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()

    const accounts = useAppSelector(selectAccounts)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const thor = useThor()

    const [inputValue, setInputValue] = useState("")
    const [underlyingAddress, setUnderlyingAddress] = useState("")
    const { getVnsName, getVnsAddress, isLoading } = useVns()

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
            const _formattedBalance = BigNutils(balance?.balance).toHuman(VET.decimals).toTokenFormat_string(2)
            setFormattedBalance(_formattedBalance)

            setWatchedAccount(account)
            openSelectAccountBottomSheet()
        },
        [accounts, openSelectAccountBottomSheet, selectedNetwork, thor],
    )

    const handleConfirmAccount = useCallback(() => {
        setBtnTitle(LL.COMMON_BTN_CONFIRM().toUpperCase())

        !!_watchedAccount && dispatch(addAccount(_watchedAccount))

        nav.goBack()
    }, [LL, _watchedAccount, dispatch, nav])

    const onImport = useCallback(
        (_address?: string) => {
            // Try to close the keyboard. Might come in handy if the user is using the camera to scan a QR code
            Keyboard.dismiss()

            const addressIsValid = AddressUtils.isValid(_address ?? underlyingAddress)
            if (!addressIsValid) {
                showErrorToast({ text1: LL.ERROR_INVALID_ADDRESS() })
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
            } else {
                // find wallet in the network and present the wallet details
                findWalletOnChain(_address ?? underlyingAddress)
            }
        },
        [LL, accounts, underlyingAddress, findWalletOnChain],
    )

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan: onImport,
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
                const name = await getVnsName(value)
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

    const handleOnIconPress = useCallback(() => {
        handleOpenCamera()
    }, [handleOpenCamera])

    return (
        <DismissKeyboardView>
            <Layout
                safeAreaTestID="Observe_Wallet_Screen"
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
                                    testID="observe-wallet-address-input"
                                    placeholder="0x..."
                                    label={LL.SEND_PLEASE_TYPE_ADDRESS()}
                                    errorMessage={error}
                                    setValue={handleOnSetAddress}
                                    value={inputValue}
                                    autoFocus
                                    onIconPress={() => (inputValue ? onClearAddress() : handleOnIconPress())}
                                    rightIcon={inputValue ? "close" : "qrcode-scan"}
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
