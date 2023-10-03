import { useCallback } from "react"
import { PendingRequestTypes, SessionTypes } from "@walletconnect/types"
import { AddressUtils, debug, error, WalletConnectUtils, warn } from "~Utils"
import { AnalyticsEvent, RequestMethods } from "~Constants"
import { AccountWithDevice } from "~Model"
import {
    changeSelectedNetwork,
    selectNetworks,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { showErrorToast, showInfoToast } from "~Components"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useSetSelectedAccount } from "~Hooks"
import { getSdkError } from "@walletconnect/utils"
import { rpcErrors } from "@metamask/rpc-errors"

export const useWcRequest = () => {
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const { LL } = useI18nContext()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectVisibleAccounts)
    const networks = useAppSelector(selectNetworks)

    const goToSignMessage = useCallback(
        async (
            requestEvent: PendingRequestTypes.Struct,
            session: SessionTypes.Struct,
            signingAccount: string,
        ) => {
            const message = WalletConnectUtils.getSignCertMessage(requestEvent)
            const options = WalletConnectUtils.getSignCertOptions(requestEvent)

            if (
                AddressUtils.isValid(options.signer) &&
                !AddressUtils.compareAddresses(options.signer, signingAccount)
            ) {
                showErrorToast({
                    text1: LL.NOTIFICATION_DAPP_REQUEST_INVALID_ACCOUNT(),
                })
            }

            options.signer = signingAccount

            if (message) {
                track(AnalyticsEvent.DAPP_REQUEST_CERTIFICATE)
                nav.navigate(Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN, {
                    requestEvent,
                    session,
                    message,
                    options,
                })
            } else {
                showErrorToast({
                    text1: LL.NOTIFICATION_DAPP_INVALID_REQUEST(),
                })

                const rpcError = rpcErrors.invalidRequest()

                const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                await web3Wallet.respondSessionRequest({
                    topic: requestEvent.topic,
                    response: {
                        id: requestEvent.id,
                        jsonrpc:
                            "The request does not contain a valid certificate message",
                        error: {
                            message: rpcError.message,
                            code: rpcError.code,
                        },
                    },
                })
            }
        },
        [LL, track, nav],
    )

    const goToSendTransaction = useCallback(
        async (
            requestEvent: PendingRequestTypes.Struct,
            session: SessionTypes.Struct,
            signingAccount: string,
        ) => {
            const message = WalletConnectUtils.getSendTxMessage(requestEvent)
            const options = WalletConnectUtils.getSendTxOptions(requestEvent)

            if (
                AddressUtils.isValid(options.signer) &&
                !AddressUtils.compareAddresses(options.signer, signingAccount)
            ) {
                showErrorToast({
                    text1: LL.NOTIFICATION_DAPP_REQUEST_INVALID_ACCOUNT(),
                })
            }

            options.signer = signingAccount

            if (message) {
                track(AnalyticsEvent.DAPP_TX_REQUESTED)
                nav.navigate(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN, {
                    requestEvent,
                    session,
                    message,
                    options,
                })
            } else {
                showErrorToast({
                    text1: LL.NOTIFICATION_DAPP_INVALID_REQUEST(),
                })

                const rpcError = rpcErrors.invalidRequest()

                const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                await web3Wallet.respondSessionRequest({
                    topic: requestEvent.topic,
                    response: {
                        id: requestEvent.id,
                        jsonrpc:
                            "The request does not contain a valid transaction message",
                        error: {
                            code: rpcError.code,
                            message: rpcError.message,
                        },
                    },
                })
            }
        },
        [LL, track, nav],
    )

    const switchAccount = useCallback(
        async (session: SessionTypes.Struct) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            // Switch to the requested account
            const address = session.namespaces.vechain.accounts[0].split(":")[2]
            const requestedAccount: AccountWithDevice | undefined =
                accounts.find(acct => {
                    return AddressUtils.compareAddresses(address, acct.address)
                })
            if (!requestedAccount) {
                await web3Wallet.disconnectSession({
                    topic: session.topic,
                    reason: {
                        code: 4100,
                        message: "Requested account not found",
                    },
                })
                throw new Error("Requested account not found")
            }

            if (
                !AddressUtils.compareAddresses(
                    requestedAccount.address,
                    selectedAccountAddress,
                )
            ) {
                onSetSelectedAccount({ address: requestedAccount.address })
                showInfoToast({
                    text1: LL.NOTIFICATION_WC_ACCOUNT_CHANGED({
                        account: requestedAccount.alias,
                    }),
                })
            }

            return requestedAccount.address
        },
        [LL, selectedAccountAddress, accounts, onSetSelectedAccount],
    )

    const switchNetwork = useCallback(
        async (
            requestEvent: PendingRequestTypes.Struct,
            session: SessionTypes.Struct,
        ) => {
            const network = WalletConnectUtils.getNetwork(
                requestEvent,
                networks,
            )

            if (!network) {
                const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

                await web3Wallet.disconnectSession({
                    topic: session.topic,
                    reason: {
                        code: -32001,
                        message: "Requested network not found",
                    },
                })
                throw new Error("Requested network not found")
            }

            if (selectedNetwork.genesis.id !== network.genesis.id) {
                dispatch(changeSelectedNetwork(network))
                showInfoToast({
                    text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                        network: network.name,
                    }),
                })
            }
        },
        [LL, selectedNetwork, dispatch, networks],
    )
    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (requestEvent: PendingRequestTypes.Struct) => {
            debug(
                "Session request: ",
                JSON.stringify({
                    id: requestEvent.id,
                    topic: requestEvent.topic,
                    method: requestEvent.params.request.method,
                }),
            )

            let session: SessionTypes.Struct

            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            try {
                // Get the session for this topic
                session = web3Wallet.engine.signClient.session.get(
                    requestEvent.topic,
                )
            } catch (e) {
                warn(
                    `Failed to get WC session for wallet: ${requestEvent.topic}`,
                    Object.keys(web3Wallet.getActiveSessions()),
                )
                await web3Wallet.respondSessionRequest({
                    topic: requestEvent.topic,
                    response: {
                        id: requestEvent.id,
                        jsonrpc: "The specified session was not found",
                        error: getSdkError("INVALID_SESSION_SETTLE_REQUEST"),
                    },
                })
                return
            }

            // Switch to the requested account
            const address = await switchAccount(session)

            // Switch to the requested network
            await switchNetwork(requestEvent, session)

            // Show the screen based on the request method
            switch (requestEvent.params.request.method) {
                case RequestMethods.SIGN_CERTIFICATE:
                    await goToSignMessage(requestEvent, session, address)
                    break
                case RequestMethods.REQUEST_TRANSACTION:
                    await goToSendTransaction(requestEvent, session, address)
                    break
                default:
                    error(
                        "Wallet Connect Session Request Invalid Method",
                        requestEvent.params.request.method,
                    )
                    break
            }
        },
        [switchAccount, switchNetwork, goToSendTransaction, goToSignMessage],
    )

    return { onSessionRequest }
}
