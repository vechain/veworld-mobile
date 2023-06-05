import { Image, StyleSheet } from "react-native"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import React from "react"
import {
    BaseText,
    BaseButton,
    BaseView,
    BaseSpacer,
    BaseBottomSheet,
    showSuccessToast,
    useWalletConnect,
} from "~Components"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { addSession } from "~Storage/Redux/Actions/WalletConnect"
import { getSdkError } from "@walletconnect/utils"
import {
    selectAccountsState,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

interface Props {
    currentProposal:
        | SignClientTypes.EventArguments["session_proposal"]
        | undefined
    onClose: () => void
}

const snapPoints = ["60%"]

export const PairBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ currentProposal, onClose }, ref) => {
        const dispatch = useAppDispatch()
        const selectedAccount =
            useAppSelector(selectAccountsState).selectedAccount
        const web3Wallet = useWalletConnect()

        const name = currentProposal?.params?.proposer?.metadata?.name
        const url = currentProposal?.params?.proposer?.metadata.url
        const methods =
            currentProposal?.params?.requiredNamespaces.vechain.methods
        const events =
            currentProposal?.params?.requiredNamespaces.vechain.events
        const chains =
            currentProposal?.params?.requiredNamespaces.vechain.chains
        const icon = currentProposal?.params.proposer.metadata.icons[0]

        const handleAccept = async () => {
            const { id, params } = currentProposal
            const { requiredNamespaces, relays } = params

            //TODO: if user accepts but the chain is not the same as the selected in config
            // then we need to ask user to change the chain

            if (currentProposal) {
                const namespaces: SessionTypes.Namespaces = {}

                Object.keys(requiredNamespaces).forEach(key => {
                    const accounts: string[] = []
                    requiredNamespaces[key].chains.map((chain: string) => {
                        ;[selectedAccount?.address].map(acc =>
                            accounts.push(`${chain}:${acc}`),
                        )
                    })

                    namespaces[key] = {
                        accounts,
                        methods: requiredNamespaces[key].methods,
                        events: requiredNamespaces[key].events,
                    }
                })

                let session = await web3Wallet?.approveSession({
                    id,
                    relayProtocol: relays[0].protocol,
                    namespaces,
                })

                dispatch(addSession(session))
                onClose()

                showSuccessToast('Successfull connected to "' + name + '"')
            }
        }

        async function handleReject() {
            const { id } = currentProposal

            if (currentProposal) {
                await web3Wallet?.rejectSession({
                    id,
                    reason: getSdkError("USER_REJECTED_METHODS"),
                })

                onClose()
            }
        }

        return (
            <BaseBottomSheet
                enablePanDownToClose={false}
                snapPoints={snapPoints}
                ref={ref}
                onPressOutside={"none"}>
                <BaseView alignItems="center" justifyContent="center">
                    <BaseText typographyFont="subTitleBold">
                        {"Session Proposal"}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={24} />

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
                            {"Chain: "} {chains}
                        </BaseText>

                        <BaseSpacer height={24} />

                        <BaseView>
                            <BaseText>{"Methods: "}</BaseText>
                            {methods?.map((method, index) => (
                                <BaseText key={method + index}>
                                    {method}
                                </BaseText>
                            ))}
                        </BaseView>

                        <BaseSpacer height={24} />

                        {events && events.length > 0 && (
                            <>
                                <BaseView>
                                    <BaseText>{"Events: "}</BaseText>
                                    {events?.map(event => (
                                        <BaseText key={event}>{event}</BaseText>
                                    ))}
                                </BaseView>

                                <BaseSpacer height={24} />
                            </>
                        )}

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
    },
)

const styles = StyleSheet.create({
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
})
