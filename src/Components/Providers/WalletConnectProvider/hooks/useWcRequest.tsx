import { useCallback, useEffect, useMemo, useState } from "react"
import { PendingRequestTypes, SessionTypes } from "@walletconnect/types"
import {
    AddressUtils,
    debug,
    error,
    MinimizerUtils,
    WalletConnectUtils,
    warn,
} from "~Utils"
import { AnalyticsEvent, RequestMethods } from "~Constants"
import { AccountWithDevice } from "~Model"
import {
    changeSelectedNetwork,
    selectNetworks,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    selectVisibleAccounts,
    selectWcState,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    ActiveSessions,
    getRpcError,
    showErrorToast,
    showInfoToast,
} from "~Components"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useSetSelectedAccount } from "~Hooks"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { ErrorResponse } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"

type PendingRequests = Record<string, PendingRequestTypes.Struct>

export const useWcRequest = (
    isBlackListScreen: () => boolean,
    activeSessions: ActiveSessions,
) => {
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const { LL } = useI18nContext()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectVisibleAccounts)
    const networks = useAppSelector(selectNetworks)
    const sessionContexts = useAppSelector(selectWcState)

    const sessions = useMemo(
        () => Object.values(activeSessions),
        [activeSessions],
    )

    const [pendingRequests, setPendingRequests] = useState<PendingRequests>({})

    const addPendingRequest = useCallback(
        (requestEvent: PendingRequestTypes.Struct) => {
            setPendingRequests(prev => ({
                ...prev,
                [requestEvent.id]: requestEvent,
            }))
        },
        [],
    )

    const removePendingRequest = useCallback(
        (requestEvent: PendingRequestTypes.Struct) => {
            setPendingRequests(prev => {
                const _prev = { ...prev }
                delete _prev[requestEvent.id]
                return _prev
            })
        },
        [],
    )

    const afterRequest = useCallback(
        (requestEvent: PendingRequestTypes.Struct) => {
            removePendingRequest(requestEvent)

            const context = sessionContexts[requestEvent.topic]

            if (context?.isDeepLink) {
                setTimeout(() => {
                    MinimizerUtils.goBack()
                }, 1000)
            }
        },
        [removePendingRequest, sessionContexts],
    )

    const processRequest = useCallback(
        async (
            requestEvent: PendingRequestTypes.Struct,
            result: Connex.Vendor.CertResponse | Connex.Vendor.TxResponse,
        ) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            debug(`Responding with WC Request ${requestEvent.id}`, result)

            await web3Wallet.respondSessionRequest({
                topic: requestEvent.topic,
                response: {
                    id: requestEvent.id,
                    jsonrpc: "2.0",
                    result,
                },
            })

            afterRequest(requestEvent)
        },
        [afterRequest],
    )

    const failRequest = useCallback(
        async (
            requestEvent: PendingRequestTypes.Struct,
            err: ErrorResponse,
        ) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            warn(`Responding with WC Request ${requestEvent.id}`, err)

            await web3Wallet.respondSessionRequest({
                topic: requestEvent.topic,
                response: {
                    id: requestEvent.id,
                    jsonrpc: "The request was rejected",
                    error: err,
                },
            })

            afterRequest(requestEvent)
        },
        [afterRequest],
    )

    const goToSignMessage = useCallback(
        (
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

                return failRequest(requestEvent, getRpcError("invalidParams"))
            }
        },
        [failRequest, LL, track, nav],
    )

    const goToSendTransaction = useCallback(
        (
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

                const rpcError = getRpcError("invalidParams")

                return failRequest(requestEvent, rpcError)
            }
        },
        [failRequest, LL, track, nav],
    )

    const switchAccount = useCallback(
        async (session: SessionTypes.Struct, web3Wallet: IWeb3Wallet) => {
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
            web3Wallet: IWeb3Wallet,
        ) => {
            const network = WalletConnectUtils.getNetwork(
                requestEvent,
                networks,
            )

            if (!network) {
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

            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            try {
                let session: SessionTypes.Struct

                try {
                    // Get the session for this topic
                    session = web3Wallet.engine.signClient.session.get(
                        requestEvent.topic,
                    )
                } catch (e) {
                    warn(
                        "Failed to get WC session for wallet: ",
                        JSON.stringify(sessions.map(s => s.topic)),
                    )
                    await web3Wallet.respondSessionRequest({
                        topic: requestEvent.topic,
                        response: {
                            id: requestEvent.id,
                            jsonrpc: "The specified session was not found",
                            error: getRpcError(
                                "internal",
                                "Could not find the associated session",
                            ),
                        },
                    })
                    return
                }

                // Switch to the requested account
                const address = await switchAccount(session, web3Wallet)

                // Switch to the requested network
                await switchNetwork(requestEvent, session, web3Wallet)

                // Show the screen based on the request method
                switch (requestEvent.params.request.method) {
                    case RequestMethods.SIGN_CERTIFICATE:
                        goToSignMessage(requestEvent, session, address)
                        break
                    case RequestMethods.REQUEST_TRANSACTION:
                        goToSendTransaction(requestEvent, session, address)
                        break
                    default:
                        error(
                            "Wallet Connect Session Request Invalid Method",
                            requestEvent.params.request.method,
                        )
                        break
                }
            } catch (e) {
                await web3Wallet.respondSessionRequest({
                    topic: requestEvent.topic,
                    response: {
                        id: requestEvent.id,
                        jsonrpc: "The request was rejected",
                        error: getRpcError("internal"),
                    },
                })

                removePendingRequest(requestEvent)
            }
        },
        [
            switchAccount,
            switchNetwork,
            goToSendTransaction,
            goToSignMessage,
            sessions,
            removePendingRequest,
        ],
    )

    /**
     * Set's a timer to run if there is a pending proposal. Will not trigger until the user is NOT processing another WC request.
     */
    useEffect(() => {
        const _pendingRequests = Object.values(pendingRequests)

        if (_pendingRequests.length === 0) return

        const request: PendingRequestTypes.Struct = _pendingRequests[0]

        let timer: NodeJS.Timeout

        //Process instantly
        if (!isBlackListScreen()) {
            onSessionRequest(request)
            //Or else loop until we can process
        } else {
            timer = setInterval(() => {
                if (isBlackListScreen()) return

                onSessionRequest(request)
            }, 250)
        }

        return () => clearTimeout(timer)
    }, [pendingRequests, isBlackListScreen, onSessionRequest])

    useEffect(() => {
        debug(
            "pendingRequests",
            Object.values(pendingRequests).map(s => s.id),
        )
    }, [pendingRequests])

    return { addPendingRequest, processRequest, failRequest }
}
