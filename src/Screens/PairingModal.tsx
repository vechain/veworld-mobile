import { Image, StyleSheet } from "react-native"
import { SignClientTypes } from "@walletconnect/types"
import React from "react"
import {
    BaseText,
    BaseButton,
    BaseView,
    BaseSpacer,
    BaseBottomSheet,
} from "~Components"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

interface Props {
    currentProposal:
        | SignClientTypes.EventArguments["session_proposal"]
        | undefined
    handleAccept: () => void
    handleReject: () => void
}

const snapPoints = ["50%"]

export const PairingModalBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ currentProposal, handleAccept, handleReject }, ref) => {
    const name = currentProposal?.params?.proposer?.metadata?.name
    const url = currentProposal?.params?.proposer?.metadata.url
    const methods = currentProposal?.params?.requiredNamespaces.vechain.methods
    const events = currentProposal?.params?.requiredNamespaces.vechain.events
    const chains = currentProposal?.params?.requiredNamespaces.vechain.chains
    const icon = currentProposal?.params.proposer.metadata.icons[0]

    return (
        <BaseBottomSheet
            enablePanDownToClose={false}
            snapPoints={snapPoints}
            ref={ref}
            onPressOutside={"none"}
            onDismiss={handleReject}>
            <BaseView>
                <BaseView>
                    <BaseView alignItems="center" justifyContent="center">
                        <Image
                            style={styles.dappLogo}
                            source={{
                                uri: icon,
                            }}
                        />
                        <BaseText>{name}</BaseText>
                        <BaseText>{url}</BaseText>
                    </BaseView>

                    <BaseSpacer height={24} />

                    <BaseText>
                        {"Chains: "} {chains}
                    </BaseText>

                    <BaseSpacer height={24} />

                    <BaseView>
                        <BaseText>{"Methods: "}</BaseText>
                        {methods?.map((method, index) => (
                            <BaseText key={method + index}>{method}</BaseText>
                        ))}
                    </BaseView>

                    <BaseSpacer height={24} />

                    <BaseView>
                        <BaseText>{"Events: "}</BaseText>
                        {events?.map(event => (
                            <BaseText key={event}>{event}</BaseText>
                        ))}
                    </BaseView>

                    <BaseSpacer height={24} />

                    <BaseView
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="row">
                        <BaseButton action={handleReject} title="Cancel" />
                        <BaseButton action={handleAccept} title="Accept" />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
})
