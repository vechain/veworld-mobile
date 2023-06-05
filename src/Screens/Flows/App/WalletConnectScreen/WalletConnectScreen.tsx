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
    showSuccessToast,
} from "~Components"
import { getSdkError } from "@walletconnect/utils"
import {
    selectSelectedAccount,
    useAppSelector,
    useAppDispatch,
    removeSession,
    selectSessions,
} from "~Storage/Redux"
import { ISession } from "@walletconnect/types"

export const WalletConnectScreen = () => {
    const web3Wallet = useWalletConnect()
    const activeSessions: ISession[] = useAppSelector(selectSessions)
    const [uri, setUri] = useState("")
    const account = useAppSelector(selectSelectedAccount)
    const dispatch = useAppDispatch()

    const onPair = useCallback(async () => {
        try {
            let result = await web3Wallet.core.pairing.pair({
                uri,
                activatePairing: true,
            })
            setUri("")
            showSuccessToast("Pairing successful")
            return result
        } catch (err: unknown) {
            // console.log("Error for pairing", err)
        }
    }, [uri, web3Wallet])

    async function disconnect() {
        if (activeSessions) {
            const topic = activeSessions[0].topic
            try {
                await web3Wallet.disconnectSession({
                    topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                })
            } catch (err: unknown) {
                // console.log("Error for disconnecting", err)
            } finally {
                dispatch(removeSession(topic))
            }
        }
    }

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
                    <BaseButton title="Connect" action={onPair} />
                </BaseView>
            ) : (
                <BaseView alignItems="center" justifyContent="center">
                    <BaseButton action={disconnect} title="Disconnect" />
                </BaseView>
            )}
        </BaseSafeArea>
    )
}
