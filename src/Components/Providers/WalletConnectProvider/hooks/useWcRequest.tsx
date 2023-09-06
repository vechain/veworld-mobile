import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { useCallback } from "react"
import { PendingRequestTypes, SessionTypes } from "@walletconnect/types"
import { AddressUtils, debug, error, WalletConnectUtils } from "~Utils"
import { AnalyticsEvent, RequestMethods } from "~Constants"
import { AccountWithDevice } from "~Model"
import {
    changeSelectedNetwork,
    selectNetworks,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { showErrorToast } from "~Components"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useSetSelectedAccount } from "~Hooks"

export const useWcRequest = (web3Wallet: IWeb3Wallet | undefined) => {
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const { LL } = useI18nContext()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const accounts = useAppSelector(selectVisibleAccounts)
    const networks = useAppSelector(selectNetworks)

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
                showErrorToast(LL.NOTIFICATION_DAPP_REQUEST_INVALID_ACCOUNT())
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
                showErrorToast(LL.NOTIFICATION_DAPP_INVALID_REQUEST())
            }
        },
        [LL, track, nav],
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
                showErrorToast(LL.NOTIFICATION_DAPP_REQUEST_INVALID_ACCOUNT())
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
                showErrorToast(LL.NOTIFICATION_DAPP_INVALID_REQUEST())
            }
        },
        [LL, track, nav],
    )

    const switchAccount = useCallback(
        async (session: SessionTypes.Struct) => {
            if (!web3Wallet)
                throw new Error("Web3Wallet is not initialized properly")

            // Switch to the requested account
            const address = session.namespaces.vechain.accounts[0].split(":")[2]
            const selectedAccount: AccountWithDevice | undefined =
                accounts.find(acct => {
                    return AddressUtils.compareAddresses(address, acct.address)
                })
            if (!selectedAccount) {
                await web3Wallet.disconnectSession({
                    topic: session.topic,
                    reason: {
                        code: 4100,
                        message: "Requested account not found",
                    },
                })
                throw new Error("Requested account not found")
            }

            onSetSelectedAccount({ address: selectedAccount.address })

            return selectedAccount.address
        },
        [accounts, onSetSelectedAccount, web3Wallet],
    )

    const switchNetwork = useCallback(
        async (
            requestEvent: PendingRequestTypes.Struct,
            session: SessionTypes.Struct,
        ) => {
            if (!web3Wallet)
                throw new Error("Web3Wallet is not initialized properly")

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

            dispatch(changeSelectedNetwork(network))
        },
        [dispatch, web3Wallet, networks],
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

            if (!web3Wallet)
                throw new Error("Web3Wallet is not initialized properly")

            // Get the session for this topic
            const session: SessionTypes.Struct =
                web3Wallet.engine.signClient.session.get(requestEvent.topic)

            // Switch to the requested account
            const address = await switchAccount(session)

            // Switch to the requested network
            await switchNetwork(requestEvent, session)

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
        },
        [
            switchAccount,
            switchNetwork,
            web3Wallet,
            goToSendTransaction,
            goToSignMessage,
        ],
    )

    return { onSessionRequest }
}
