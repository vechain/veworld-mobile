import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProposalTypes, RelayerTypes, SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import React, { FC, useCallback, useEffect, useMemo } from "react"
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
    showInfoToast,
    showSuccessToast,
} from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { AccountWithDevice } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    addConnectedAppActivity,
    changeSelectedNetwork,
    selectNetworks,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { debug, error, HexUtils, WalletConnectUtils, warn } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests, AppInfo, UnknownAppMessage } from "~Screens"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECT_APP_SCREEN
>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const networks = useAppSelector(selectNetworks)

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { name, url, methods, icon, description, chains } = useMemo(
        () => WalletConnectUtils.getPairAttributes(currentProposal),
        [currentProposal],
    )

    /**
     * If the dApp requests ONLY one chain, switch to that chain
     */
    useEffect(() => {
        if (chains && chains.length === 1) {
            const requestedChain = chains[0]

            const requestedNetwork = networks.find(net =>
                HexUtils.compare(
                    net.genesis.id.slice(-32),
                    requestedChain.split(":")[1],
                ),
            )

            if (requestedNetwork) {
                dispatch(changeSelectedNetwork(requestedNetwork))
                showInfoToast({
                    text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                        network: requestedNetwork.name,
                    }),
                })
            }
        }
    }, [networks, LL, dispatch, chains])

    /**
     * Handle session proposal
     */
    const processProposal = useCallback(async () => {
        const { id, params } = currentProposal

        const requiredNamespaces: ProposalTypes.RequiredNamespaces =
            params.requiredNamespaces
        const relays: RelayerTypes.ProtocolOptions[] = params.relays

        if (!currentProposal || !requiredNamespaces.vechain.chains) {
            warn("ConnectedAppScreen - session not valid")
            showErrorToast({
                text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
            })
            return
        }

        // Setup vechain namespaces to return to the dapp
        const namespaces: SessionTypes.Namespaces = {}
        const connectedAccounts: string[] = []
        const networkIdentifiers = networks.map(network =>
            network.genesis.id.slice(-32),
        )

        const _networks =
            requiredNamespaces.vechain.chains ??
            networks.map(network => `vechain:${network.genesis.id.slice(-32)}`)

        _networks.map((scope: string) => {
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
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            const session = await web3Wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            })

            // DO NOT remove this: This is a bit of a hack of iOS 17. Session wasn't getting returned to the dApp unless that got called
            const activeSessions = web3Wallet.getActiveSessions()

            if (activeSessions[session.topic]) {
                debug("Session successfully added")
            }

            dispatch(addConnectedAppActivity(name, url, description, methods))

            showSuccessToast({
                text1: LL.NOTIFICATION_wallet_connect_successfull_connection({
                    name,
                }),
            })
        } catch (err: unknown) {
            error("ConnectedAppScreen:handleAccept", err)
            showErrorToast({
                text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
            })
        }
    }, [
        currentProposal,
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
                const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                await web3Wallet.rejectSession({
                    id,
                    reason: getSdkError("USER_REJECTED_METHODS"),
                })
            } catch (err: unknown) {
                error("ConnectedAppScreen:handleReject", err)
            } finally {
                nav.goBack()
            }
        }
    }, [currentProposal, nav])

    const onPressBack = useCallback(async () => {
        await handleReject()
        nav.goBack()
    }, [nav, handleReject])

    const isConfirmDisabled = useMemo(() => {
        const { validation } = currentProposal.verifyContext.verified

        if (validation === "UNKNOWN" && !isInvalidChecked) {
            return true
        }

        return validation === "INVALID"
    }, [currentProposal, isInvalidChecked])

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

                    <UnknownAppMessage
                        verifyContext={currentProposal.verifyContext}
                        confirmed={isInvalidChecked}
                        setConfirmed={setInvalidChecked}
                    />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_CONNECT()}
                        action={processProposal}
                        disabled={isConfirmDisabled}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="Light"
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
