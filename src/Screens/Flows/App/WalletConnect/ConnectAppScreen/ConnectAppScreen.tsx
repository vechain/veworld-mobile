import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProposalTypes, SessionTypes, SignClientTypes } from "@walletconnect/types"
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
import { AccountWithDevice, WatchedAccount } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    addConnectedAppActivity,
    changeSelectedNetwork,
    selectNetworks,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils, warn } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests, AppInfo, UnknownAppMessage } from "~Screens"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"
import { distinctValues } from "~Utils/ArrayUtils"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ERROR_EVENTS, RequestMethods } from "~Constants"
import { useObservedAccountExclusion } from "../Hooks"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECT_APP_SCREEN>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const { request } = route.params

    const hasNavigatedBack = React.useRef(false)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { approvePendingProposal, rejectPendingProposal, activeSessions } = useWalletConnect()
    const { postMessage, addAppAndNavToRequest } = useInAppBrowser()

    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { visibleAccounts, selectedAccount, onSubmit } = useObservedAccountExclusion({
        openSelectAccountBottomSheet,
    })

    const networks = useAppSelector(selectNetworks)

    const navBack = useCallback(() => {
        if (hasNavigatedBack.current) return

        hasNavigatedBack.current = true
        if (nav.canGoBack()) {
            nav.goBack()
        } else {
            nav.navigate(Routes.DISCOVER)
        }
    }, [nav])

    /**
     * Navigates back if we have already processed the request
     */
    useEffect(() => {
        if (request.type !== "wallet-connect") return
        const sessions = Object.values(activeSessions)

        if (sessions.some(_session => _session.pairingTopic === request.proposal.params.pairingTopic)) {
            navBack()
        }
    }, [request, navBack, activeSessions])

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { appName, appUrl, iconUrl, description } = request

    const appUrlOrigin = useMemo(() => new URL(appUrl).origin, [appUrl])

    const methods = useMemo(() => {
        if (request.type === "in-app") {
            return [RequestMethods.REQUEST_TRANSACTION, RequestMethods.SIGN_CERTIFICATE]
        } else {
            const namespace = request.proposal.params.requiredNamespaces.vechain

            if (!namespace) return []

            return namespace.methods
        }
    }, [request])

    /**
     * If the dApp requests ONLY one chain, switch to that chain
     */
    useEffect(() => {
        if (request.type !== "wallet-connect") return

        if (!request.proposal.params.requiredNamespaces.vechain) return

        const chains = request.proposal.params.requiredNamespaces.vechain.chains

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
    }, [networks, LL, dispatch, request])

    /**
     * Handle session proposal
     */
    const processProposal = useCallback(
        async (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
            const { params } = proposal

            const namespaces: SessionTypes.Namespaces = {}

            const addNamespaces = (proposedNamespaces: Record<string, ProposalTypes.BaseRequiredNamespace>) => {
                for (const key of Object.keys(proposedNamespaces)) {
                    warn(ERROR_EVENTS.WALLET_CONNECT, proposedNamespaces[key])

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
                await approvePendingProposal(proposal, namespaces)

                dispatch(addConnectedAppActivity(appName, appUrlOrigin, description))

                showSuccessToast({
                    text1: LL.NOTIFICATION_wallet_connect_successfull_connection({
                        name: appName,
                    }),
                })
            } catch (err: unknown) {
                error(ERROR_EVENTS.WALLET_CONNECT, err)
                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_error_pairing(),
                })
            } finally {
                navBack()

                dispatch(setIsAppLoading(false))
            }
        },
        [
            appName,
            appUrlOrigin,
            approvePendingProposal,
            LL,
            networks,
            selectedAccount.address,
            dispatch,
            description,
            navBack,
        ],
    )

    /**
     * Handle session rejection
     */
    const handleReject = useCallback(async () => {
        if (request.type === "wallet-connect") {
            try {
                await rejectPendingProposal(request.proposal)
            } catch (err: unknown) {
                error(ERROR_EVENTS.WALLET_CONNECT, err)
            } finally {
                navBack()
            }
        } else {
            postMessage({
                id: request.initialRequest.id,
                error: "User rejected the request",
                method: request.initialRequest.method,
            })
            navBack()
        }
    }, [postMessage, request, navBack, rejectPendingProposal])

    const onPressBack = useCallback(async () => {
        await handleReject()
        navBack()
    }, [navBack, handleReject])

    const isConfirmDisabled = useMemo(() => {
        if (request.type !== "wallet-connect") return false

        const { validation } = request.proposal.verifyContext.verified

        if (validation === "UNKNOWN" && !isInvalidChecked) {
            return true
        }

        return validation === "INVALID"
    }, [request, isInvalidChecked])

    const handleAccept = useCallback(async () => {
        if (request.type === "wallet-connect") {
            await processProposal(request.proposal)
        } else {
            addAppAndNavToRequest(request.initialRequest)
        }
    }, [processProposal, request, addAppAndNavToRequest])

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

                    <AppInfo name={appName} url={appUrlOrigin} icon={iconUrl} description={description} />

                    <BaseSpacer height={30} />
                    <AppConnectionRequests name={appName} methods={methods} />
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

                    {request.type === "wallet-connect" && (
                        <UnknownAppMessage
                            verifyContext={request.proposal.verifyContext.verified}
                            confirmed={isInvalidChecked}
                            setConfirmed={setInvalidChecked}
                        />
                    )}
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_CONNECT()}
                        action={() => onSubmit(handleAccept)}
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
