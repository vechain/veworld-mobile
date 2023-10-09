import {
    changeSelectedNetwork,
    selectAccounts,
    selectNetworks,
    selectPendingRequests,
    selectPendingSession,
    selectSelectedAccountAddress,
    selectSelectedNetwork,
    selectWalletConnectDeepLinks,
    useAppDispatch,
    useAppSelector,
    WalletConnectRequest,
} from "~Storage/Redux"
import { useCallback, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { AddressUtils, debug, error } from "~Utils"
import { showInfoToast, useWcPairing } from "~Components"
import { AccountWithDevice } from "~Model"
import { useI18nContext } from "~i18n"
import { rpcErrors } from "@metamask/rpc-errors"
import { useSetSelectedAccount } from "~Hooks"
import { WalletConnectService } from "~Services"

const ROUTE_BLACKLIST: string[] = [
    Routes.CONNECT_APP_SCREEN,
    Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN,
    Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN,
    Routes.LEDGER_SIGN_TRANSACTION,
    Routes.LEDGER_SIGN_CERTIFICATE,
]

export const useWcNavigationOnEvent = () => {
    const { handleLinkingUrl } = useWcPairing()

    const dispatch = useAppDispatch()
    const deepLinks = useAppSelector(selectWalletConnectDeepLinks)
    const pendingSession = useAppSelector(selectPendingSession)
    const pendingRequests = useAppSelector(selectPendingRequests)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const networks = useAppSelector(selectNetworks)
    const accounts = useAppSelector(selectAccounts)
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { LL } = useI18nContext()

    const nav = useNavigation()

    const isBlackList = useCallback(() => {
        const navState = nav.getState()

        if (!navState) return true

        for (const route of navState.routes) {
            if (ROUTE_BLACKLIST.includes(route.name)) return true
        }

        return false
    }, [nav])

    const switchNetwork = useCallback(
        async (wcRequest: WalletConnectRequest) => {
            const { topic, chainId } = wcRequest

            const network = networks.find(
                net =>
                    net.genesis.id.slice(-32).toLowerCase() ===
                    chainId.toLowerCase(),
            )

            if (!network) {
                await WalletConnectService.disconnectSession(topic, {
                    code: -32001,
                    message: "Requested network not found",
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

    const switchAccount = useCallback(
        async (wcRequest: WalletConnectRequest) => {
            const { topic, account } = wcRequest

            // Switch to the requested account
            const address = account.split(":")[2]
            const requestedAccount: AccountWithDevice | undefined =
                accounts.find(acct => {
                    return AddressUtils.compareAddresses(address, acct.address)
                })
            if (!requestedAccount) {
                await WalletConnectService.rejectRequest(
                    wcRequest.requestId,
                    wcRequest.topic,
                    rpcErrors.resourceNotFound(
                        "The requested account was not found",
                    ),
                )

                await WalletConnectService.disconnectSession(topic, {
                    code: 4100,
                    message: "Requested account not found",
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

    const navigateToRequestScreen = useCallback(
        async (request: WalletConnectRequest) => {
            await switchNetwork(request)
            await switchAccount(request)

            if (request.type === "tx") {
                nav.navigate(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN, {
                    request,
                })
            } else {
                nav.navigate(Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN, {
                    request,
                })
            }
        },
        [nav, switchAccount, switchNetwork],
    )

    useEffect(() => {
        if (isBlackList()) return

        if (pendingSession) {
            nav.navigate(Routes.CONNECT_APP_SCREEN, {
                sessionProposal: pendingSession,
            })
        }
    }, [isBlackList, pendingSession, nav])

    useEffect(() => {
        if (isBlackList()) return

        if (pendingRequests.length > 0) {
            const pendingRequest = pendingRequests[0]

            navigateToRequestScreen(pendingRequest)
                .then(() => {
                    debug("Navigated to request screen")
                })
                .catch(err => {
                    error("Failed to navigate to request screen", err)
                })
        }
    }, [navigateToRequestScreen, pendingRequests, isBlackList])

    useEffect(() => {
        if (deepLinks.length > 0) {
            const deepLink = deepLinks[0]

            handleLinkingUrl(deepLink)
                .then(() => {
                    debug("WalletConnectProvider:onPair - success")
                })
                .catch(err => {
                    error("WalletConnectProvider:onPair - err", err)
                })
        }
    }, [handleLinkingUrl, deepLinks])
}
