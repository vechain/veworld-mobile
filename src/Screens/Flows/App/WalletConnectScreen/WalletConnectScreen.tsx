import React, { useState, useCallback } from "react"
import {
    BaseText,
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseButton,
    BaseTextInput,
    BaseView,
    useWalletConnect,
    showErrorToast,
    showInfoToast,
} from "~Components"
import { getSdkError } from "@walletconnect/utils"
import {
    selectSelectedAccount,
    useAppSelector,
    useAppDispatch,
    selectSessions,
} from "~Storage/Redux"
import { SessionTypes } from "@walletconnect/types"
import { deleteSession } from "~Storage/Redux/Slices"
import { error } from "~Common"

export const WalletConnectScreen = () => {
    const web3Wallet = useWalletConnect()
    const activeSessions: SessionTypes.Struct[] = useAppSelector(selectSessions)
    const [uri, setUri] = useState("")
    const account = useAppSelector(selectSelectedAccount)
    const dispatch = useAppDispatch()
    const [isPairing, setIsPairing] = useState(false)

    /**
     * The pair method initiates a WalletConnect pairing process with a dapp
     * using the given uri (QR code from the dapps).
     * After the pairing is established, the dapp will send a session_proposal
     * asking the user permission to connect to the wallet.
     */
    const onPair = useCallback(async () => {
        setIsPairing(true)
        try {
            await web3Wallet.core.pairing.pair({
                uri,
                activatePairing: true,
            })

            setUri("")
            showInfoToast("Connecting may take a few seconds.")
        } catch (err: unknown) {
            error(err)

            showErrorToast(
                "Error pairing with Dapp, please generate a new QR CODE",
            )
        } finally {
            setIsPairing(false)
        }
    }, [uri, web3Wallet])

    const disconnect = useCallback(async () => {
        if (activeSessions) {
            const topic = activeSessions[0].topic
            try {
                await web3Wallet.disconnectSession({
                    topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                })
            } catch (err: unknown) {
                error(err)
            } finally {
                dispatch(deleteSession({ topic }))
            }
        }
    }, [activeSessions, web3Wallet, dispatch])

    return (
        <BaseSafeArea>
            <BackButtonHeader />
            <BaseText>{"Wallet Connect Screen"}</BaseText>

            <BaseSpacer height={24} />
            <BaseText>
                {"Address: "} {account?.address || "Loading..."}
            </BaseText>
            <BaseSpacer height={24} />

            <BaseText>
                {"Active Sessions: "} {activeSessions.length || 0}
            </BaseText>
            <BaseSpacer height={24} />

            <BaseText>
                {"Current Session Topic: "}{" "}
                {activeSessions?.length > 0
                    ? activeSessions[0]?.topic
                    : "No active sessions"}
            </BaseText>
            <BaseSpacer height={24} />

            {activeSessions?.length < 1 ? (
                <BaseView alignItems="center" justifyContent="center">
                    <BaseTextInput
                        placeholder={"Place here the WC URI"}
                        label={"WC URI"}
                        setValue={setUri}
                        value={uri}
                        testID="wc-uri"
                    />
                    <BaseButton
                        title="Connect"
                        action={onPair}
                        disabled={isPairing}
                    />
                </BaseView>
            ) : (
                <BaseView alignItems="center" justifyContent="center">
                    <BaseButton action={disconnect} title="Disconnect" />
                </BaseView>
            )}
        </BaseSafeArea>
    )
}
