import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProposalTypes, RelayerTypes, SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import React, { FC, useCallback } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    AccountCard,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    SelectAccountBottomSheet,
    showErrorToast,
    showSuccessToast,
    useWalletConnect,
} from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { AccountWithDevice } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    addConnectedAppActivity,
    insertSession,
    selectNetworks,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, WalletConnectUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests } from "./Components"
import { AppInfo } from "../Components"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECT_APP_SCREEN
>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { web3Wallet } = useWalletConnect()

    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const networks = useAppSelector(selectNetworks)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()
    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { name, url, methods, icon, description } =
        WalletConnectUtils.getPairAttributes(currentProposal)

    /**
     * Handle session proposal
     */
    const handleAccept = useCallback(async () => {
        const { id, params } = currentProposal

        const requiredNamespaces: ProposalTypes.RequiredNamespaces =
            params.requiredNamespaces
        const relays: RelayerTypes.ProtocolOptions[] = params.relays

        if (!web3Wallet) {
            showErrorToast(LL.NOTIFICATION_wallet_connect_not_initialized())
            return
        }

        if (!currentProposal || !requiredNamespaces.vechain.chains) {
            showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
            return
        }

        // Setup vechain namespaces to return to the dapp
        const namespaces: SessionTypes.Namespaces = {}
        const connectedAccounts: string[] = []
        const networkIdentifiers = networks.map(network =>
            network.genesis.id.slice(-32),
        )

        requiredNamespaces.vechain.chains?.map((scope: string) => {
            // Valid only for supported networks
            // scope example: vechain:b1ac3413d346d43539627e6be7ec1b4a, vechain:87721b09ed2e15997f466536b20bb127
            const network = scope.split(":")[1]

            if (networkIdentifiers.includes(network)) {
                connectedAccounts.push(`${scope}:${selectedAccount.address}`)
            }
        })

        namespaces.vechain = {
            accounts: connectedAccounts,
            methods: requiredNamespaces.vechain.methods,
            events: requiredNamespaces.vechain.events,
        }

        // Doing this nav.navigate before approveSession because after approveSession the DApp
        // is IMMEDIATELY sending a session_proposal and the nav.navigate is
        // closing the session proposal screen instead of this one
        nav.navigate(Routes.SETTINGS_CONNECTED_APPS)

        try {
            let session: SessionTypes.Struct = await web3Wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            })

            dispatch(
                insertSession({
                    address: selectedAccount.address,
                    session,
                }),
            )

            dispatch(addConnectedAppActivity(name, url, description, methods))

            showSuccessToast(
                LL.NOTIFICATION_wallet_connect_successfull_connection({
                    name,
                }),
            )
        } catch (err: unknown) {
            error("ConnectedAppScreen:handleAccept", err)
            showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
        }
    }, [
        currentProposal,
        web3Wallet,
        nav,
        LL,
        networks,
        selectedAccount.address,
        dispatch,
        name,
        url,
        description,
        methods,
    ])

    /**
     * Handle session rejection
     */
    const handleReject = useCallback(async () => {
        if (currentProposal) {
            const { id } = currentProposal

            try {
                await web3Wallet?.rejectSession({
                    id,
                    reason: getSdkError("USER_REJECTED_METHODS"),
                })
            } catch (err: unknown) {
                error("ConnectedAppScreen:handleReject", err)
            } finally {
                nav.goBack()
            }
        }
    }, [currentProposal, nav, web3Wallet])

    const onPressBack = useCallback(async () => {
        await handleReject()
        nav.goBack()
    }, [nav, handleReject])

    return (
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onPressBack} />
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {LL.CONNECTED_APP_TITLE()}
                    </BaseText>

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APP_REQUEST()}
                    </BaseText>

                    <BaseSpacer height={16} />
                    <AppInfo
                        name={name}
                        url={url}
                        icon={icon}
                        description={description}
                    />

                    <BaseSpacer height={30} />
                    <AppConnectionRequests name={name} methods={methods} />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">
                        {LL.COMMON_SELECT_ACCOUNT()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        onPress={openSelectAccountBottomSheet}
                        showSelectAccountIcon={true}
                    />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={LL.COMMON_BTN_CONNECT()}
                        action={handleAccept}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        variant="outline"
                        title={LL.COMMON_BTN_CANCEL_CAPS_LOCK()}
                        action={handleReject}
                    />
                </BaseView>
            </ScrollView>

            <SelectAccountBottomSheet
                closeBottomSheet={closeSelectAccountBottonSheet}
                accounts={visibleAccounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBottomSheetRef}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
