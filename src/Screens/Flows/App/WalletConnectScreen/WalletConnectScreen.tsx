import React, { useState, useCallback } from "react"
import {
    BaseText,
    BackButtonHeader,
    BaseSafeArea,
    BaseButton,
    BaseTextInput,
    BaseView,
    useWalletConnect,
    showErrorToast,
    showInfoToast,
} from "~Components"
import { useAppSelector, selectSessions, selectAccounts } from "~Storage/Redux"
import { SessionTypes } from "@walletconnect/types"
import { error } from "~Common"
import { FlatList } from "react-native-gesture-handler"
import { isEmpty } from "lodash"
import { Session } from "./components"

type SessionsListProps = {
    item: SessionTypes.Struct
}

export const WalletConnectScreen = () => {
    const { web3Wallet } = useWalletConnect()
    const activeSessions: Record<string, SessionTypes.Struct[]> =
        useAppSelector(selectSessions)
    // console.log("activeSessions", activeSessions)

    const [uri, setUri] = useState("")
    const accounts = useAppSelector(selectAccounts)
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
            await web3Wallet?.core.pairing.pair({
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

    const renderSession = useCallback(({ item }: SessionsListProps) => {
        return <Session item={item} />
    }, [])

    return (
        <BaseSafeArea>
            <BackButtonHeader />
            <BaseText>{"Wallet Connect Screen"}</BaseText>

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

            {accounts.map(account => {
                if (
                    account.address in activeSessions &&
                    !isEmpty(activeSessions[account.address])
                ) {
                    return (
                        <BaseSafeArea key={account.address}>
                            <BaseText>{account.alias}</BaseText>
                            <FlatList
                                data={activeSessions[account.address]}
                                // contentContainerStyle={styles.listContainer}
                                numColumns={1}
                                keyExtractor={session => String(session.topic)}
                                renderItem={renderSession}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                            />
                        </BaseSafeArea>
                    )
                }
            })}
        </BaseSafeArea>
    )
}
