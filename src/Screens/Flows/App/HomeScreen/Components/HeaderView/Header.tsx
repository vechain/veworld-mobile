import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { error, useBottomSheetModal, useTheme } from "~Common"
import {
    BaseIcon,
    BaseText,
    BaseView,
    ScanWalletConnectBottomSheet,
    showErrorToast,
    showInfoToast,
    useWalletConnect,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { web3Wallet } = useWalletConnect()

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    /**
     * The pair method initiates a WalletConnect pairing process with a dapp
     * using the given uri (QR code from the dapps).
     * After the pairing is established, the dapp will send a session_proposal
     * asking the user permission to connect to the wallet.
     */
    const onWalletConnectPair = useCallback(
        async (uri: string) => {
            try {
                await web3Wallet?.core.pairing.pair({
                    uri,
                    activatePairing: true,
                })

                showInfoToast("Connecting may take a few seconds.")
            } catch (err: unknown) {
                error(err)

                showErrorToast(
                    "Error pairing with Dapp, please generate a new QR CODE",
                )
            }
        },
        [web3Wallet],
    )

    const onScan = useCallback(
        (uri: string) => {
            onWalletConnectPair(uri)
        },
        [onWalletConnectPair],
    )

    return (
        <BaseView
            w={100}
            px={20}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <BaseView alignItems="flex-start" alignSelf="flex-start">
                <BaseText typographyFont="largeTitle" testID="veworld-homepage">
                    {LL.VEWORLD()}
                </BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <BaseIcon
                    name={"flip-horizontal"}
                    size={24}
                    color={theme.colors.text}
                    action={openScanAddressSheet}
                    mx={12}
                />

                <BaseIcon
                    name={"wallet-outline"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={goToWalletManagement}
                />
            </BaseView>
            <ScanWalletConnectBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
            />
        </BaseView>
    )
})
