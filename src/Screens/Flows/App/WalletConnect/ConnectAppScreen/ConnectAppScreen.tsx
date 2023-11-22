import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProposalTypes, SessionTypes } from "@walletconnect/types"
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
    useWalletConnect,
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
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils, WalletConnectUtils, warn } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests, AppInfo, UnknownAppMessage } from "~Screens"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"
import { distinctValues } from "~Utils/ArrayUtils"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECT_APP_SCREEN>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { approvePendingProposal, rejectPendingProposal, activeSessions } = useWalletConnect()

    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const networks = useAppSelector(selectNetworks)

    /**
     * Navigates back if we have already processed the request
     */
    useEffect(() => {
        const sessions = Object.values(activeSessions)

        if (sessions.some(_session => _session.pairingTopic === currentProposal.params.pairingTopic)) {
            if (nav.canGoBack()) {
                nav.goBack()
            } else {
                nav.navigate(Routes.HOME)
            }
        }
    }, [currentProposal, nav, activeSessions])

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
                HexUtils.compare(net.genesis.id.slice(-32), requestedChain.split(":")[1]),
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
        const { params } = currentProposal

        const namespaces: SessionTypes.Namespaces = {}

        const addNamespaces = (proposedNamespaces: Record<string, ProposalTypes.BaseRequiredNamespace>) => {
            for (const key of Object.keys(proposedNamespaces)) {
                warn(proposedNamespaces[key])

                const _chains =
                    proposedNamespaces[key].chains ??
                    networks.map(network => `vechain:${network.genesis.id.slice(-32)}`)

                const accounts = _chains.map((scope: string) => {
                    return `${scope}:${selectedAccount.address}`
                })

                if (namespaces[key]) {
                    namespaces[key] = {
                        methods: distinctValues([...namespaces[key].methods, ...proposedNamespaces[key].methods]),
                        events: distinctValues([...namespaces[key].events, ...proposedNamespaces[key].events]),
                        accounts: distinctValues([...namespaces[key].accounts, ...accounts]),
                    }
                } else {
                    namespaces[key] = {
                        methods: proposedNamespaces[key].methods,
                        events: proposedNamespaces[key].events,
                        accounts,
                    }
                }
            }
        }

        addNamespaces(params.requiredNamespaces)
        addNamespaces(params.optionalNamespaces)

        dispatch(setIsAppLoading(true))

        try {
            await approvePendingProposal(currentProposal, namespaces)

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
        } finally {
            nav.goBack()
            dispatch(setIsAppLoading(false))
        }
    }, [
        currentProposal,
        approvePendingProposal,
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
            try {
                await rejectPendingProposal(currentProposal)
            } catch (err: unknown) {
                error("ConnectedAppScreen:handleReject", err)
            } finally {
                nav.goBack()
            }
        }
    }, [currentProposal, nav, rejectPendingProposal])

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
                    <BaseText typographyFont="title">{LL.CONNECTED_APP_TITLE()}</BaseText>

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitle">{LL.CONNECTED_APP_REQUEST()}</BaseText>

                    <BaseSpacer height={16} />

                    <AppInfo name={name} url={url} icon={icon} description={description} />

                    <BaseSpacer height={30} />
                    <AppConnectionRequests name={name} methods={methods} />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">{LL.COMMON_SELECT_ACCOUNT()}</BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        onPress={openSelectAccountBottomSheet}
                        showSelectAccountIcon={true}
                    />

                    <UnknownAppMessage
                        verifyContext={currentProposal.verifyContext.verified}
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
