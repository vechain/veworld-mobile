import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { SessionTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import { Image, StyleSheet } from "react-native"
import {
    BaseButton,
    BaseView,
    BaseText,
    BaseSpacer,
    useWalletConnect,
    BaseBottomSheet,
    AccountIcon,
} from "~Components"
import { AccountWithDevice } from "~Model"
import { FormattingUtils } from "~Utils"

const snapPoints = ["65%"]

type Props = {
    onClose: () => void
    session: SessionTypes.Struct
    account: AccountWithDevice
}

export const AppDetailsBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, session, account }, ref) => {
    const { disconnect } = useWalletConnect()

    const disconnectSession = useCallback(() => {
        disconnect(session.topic)
        onClose()
    }, [session, disconnect, onClose])

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref} onDismiss={onClose}>
            <BaseView mx={20}>
                <BaseText typographyFont="title">{"Connected app"}</BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="subSubTitleLight">
                    {"External app connection"}
                </BaseText>

                <BaseSpacer height={24} />
                <Image
                    style={styles.dappLogo}
                    source={{
                        uri: session.peer.metadata.icons[0],
                    }}
                />

                <BaseSpacer height={14} />
                <BaseText typographyFont="subSubTitle">
                    {session.peer.metadata.name}
                </BaseText>

                <BaseSpacer height={8} />
                <BaseText>{session.peer.metadata.description}</BaseText>

                <BaseSpacer height={8} />
                <BaseText typographyFont="caption">
                    {session.peer.metadata.url}
                </BaseText>

                <BaseSpacer height={24} />
                <BaseText typographyFont="subSubTitle">
                    {"Connected with"}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseView flexDirection="row">
                    <AccountIcon address={account.address} />
                    <BaseSpacer width={8} />
                    <BaseView>
                        <BaseText typographyFont="subSubTitle">
                            {account.alias}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">
                            {FormattingUtils.humanAddress(account.address)}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseSpacer height={24} />
                <BaseButton action={disconnectSession} title="Disconnect" />
            </BaseView>
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    innerContainer: {
        height: 45,
    },
    container: {
        width: "100%",
    },
    image: { width: 40, height: 40, borderRadius: 24 },
    dappLogo: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginVertical: 4,
    },
    rightSubContainer: {
        width: "50%",
        flexDirection: "column",
        alignItems: "flex-end",
    },
    wallet: {
        opacity: 0.7,
    },
    address: {
        opacity: 0.7,
    },
    walletContainer: {
        flex: 1,
    },
})
