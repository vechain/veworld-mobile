import { useCallback, useEffect, useMemo, useState } from "react"
import { PendingRequestTypes, SessionTypes } from "@walletconnect/types"
import {
    AddressUtils,
    debug,
    error,
    HexUtils,
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
import { HDNode } from "thor-devkit"
import { secp256k1 } from "thor-devkit/dist/secp256k1"
import { keccak256 } from "thor-devkit/dist/keccak"

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

    const processRequest = useCallback(
        async (requestEvent: PendingRequestTypes.Struct, result: any) => {
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

            removePendingRequest(requestEvent)
        },
        [removePendingRequest],
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

            removePendingRequest(requestEvent)
        },
        [removePendingRequest],
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

            let address: string | undefined

            for (const key of Object.keys(session.namespaces)) {
                address = session.namespaces[key].accounts[0].split(":")[2]
            }

            if (!address) {
                await web3Wallet.disconnectSession({
                    topic: session.topic,
                    reason: {
                        code: 4100,
                        message: "No account found in session",
                    },
                })
                throw new Error("No address found in session")
            }

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

    const hardcodedPersonalSign = useCallback(
        async (requestEvent: PendingRequestTypes.Struct) => {
            const hdNode = HDNode.fromMnemonic(
                "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(
                    " ",
                ),
            )

            const message = requestEvent.params.request.params[0]

            const utf8Message = Buffer.from(
                HexUtils.removePrefix(message),
                "hex",
            ).toString("utf8")

            //\x19Ethereum Signed Message:\n<length of message>
            const messageToSign = `\x19Ethereum Signed Message:\n${utf8Message.length}${utf8Message}`

            const hash = keccak256(Buffer.from(messageToSign, "utf8"))

            const signature = secp256k1.sign(hash, hdNode.derive(0).privateKey!)

            warn("Signature: ", signature.length)

            const result = `0x${signature.toString("hex")}`

            showInfoToast({
                text1: "Auto Signed a message",
                text2: utf8Message,
                visibilityTime: 20000,
            })

            return await processRequest(requestEvent, result)
        },
        [processRequest],
    )

    /**
     * Handle session request
     */
    const onSessionRequest = useCallback(
        async (requestEvent: PendingRequestTypes.Struct) => {
            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            debug(
                "Session request: ",
                JSON.stringify({
                    id: requestEvent.id,
                    topic: requestEvent.topic,
                    params: requestEvent.params.request,
                }),
            )

            if (requestEvent.params.request.method === "personal_sign") {
                return await hardcodedPersonalSign(requestEvent)
            }

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
                    return
                }

                // Switch to the requested account
                const address = await switchAccount(session, web3Wallet)

                // Switch to the requested network
                await switchNetwork(requestEvent, session, web3Wallet)

                // Show the screen based on the request method
                switch (requestEvent.params.request.method) {
                    case RequestMethods.SIGN_CERTIFICATE:
                        await goToSignMessage(requestEvent, session, address)
                        break
                    case RequestMethods.REQUEST_TRANSACTION:
                        await goToSendTransaction(
                            requestEvent,
                            session,
                            address,
                        )
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
            hardcodedPersonalSign,
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
            JSON.stringify(pendingRequests[0]),
        )
    }, [pendingRequests])

    return { addPendingRequest, processRequest, failRequest }
}
