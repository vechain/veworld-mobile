import React, { useEffect } from "react"
import { debug, WalletConnectUtils } from "~Utils"
import { Linking } from "react-native"
import { addDeepLink, removeSession, useAppDispatch } from "~Storage/Redux"
import { useWcNavigationOnEvent } from "~Components/Providers/WalletConnectProviderV2/hooks/useWcNavigationOnEvent"
import {
    onSessionProposal,
    onSessionRequest,
} from "~Components/Providers/WalletConnectProviderV2/helpers/WCListeners"

/**
 * Wallet Connect Flow:
 * 1) A pairing needs to be established by scanning the QR code or by manually pasting the URI
 * 2) After pairing is established the dapp will send a session_proposal asking the user permission to connect to the wallet
 * 3) Once the dapp and the wallet are connected the dapp can send session_requests asking to sign certificates or execute transactions
 *
 * This provider was created to have a singleton web3wallet instance, so that all modals regarding session proposals and requests
 * are handled by the provider can be shown no matter where we are inside the app.
 */

type WalletConnectContextProviderProps = { children: React.ReactNode }

const WalletConnectContext = React.createContext<{}>({})

const WalletConnectContextProvider = ({
    children,
}: WalletConnectContextProviderProps) => {
    const dispatch = useAppDispatch()

    useWcNavigationOnEvent()

    useEffect(() => {
        WalletConnectUtils.getWeb3Wallet().then(async web3Wallet => {
            web3Wallet.on("session_proposal", async proposal => {
                await dispatch(onSessionProposal(proposal))
            })

            web3Wallet.on("session_request", async request => {
                await dispatch(onSessionRequest(request))
            })

            web3Wallet.on("session_delete", request => {
                dispatch(removeSession({ topic: request.topic }))
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Handle initial linking URL
     */
    useEffect(() => {
        Linking.getInitialURL().then(deepLink => {
            debug("WalletConnectProvider:Linking.getInitialURL", deepLink)
            if (deepLink) {
                dispatch(addDeepLink({ deepLink }))
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Sets up a listener for DApp session proposals
     * - Don't set any dependencies here, otherwise the listener will be added multiple times (there was trouble removing, screen crashes etc.)
     */
    useEffect(() => {
        if (Linking.listenerCount("url") > 0) {
            Linking.removeAllListeners("url")
        }

        Linking.addListener("url", event => {
            debug("WalletConnectProvider:Linking.addListener", event)
            if (event.url) {
                dispatch(addDeepLink({ deepLink: event.url }))
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <WalletConnectContext.Provider value={{}}>
            {children}
        </WalletConnectContext.Provider>
    )
}

export { WalletConnectContextProvider }
