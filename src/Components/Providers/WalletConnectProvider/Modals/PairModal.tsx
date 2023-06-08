import { Image, StyleSheet } from "react-native"
import {
    SessionTypes,
    SignClientTypes,
    ProposalTypes,
    RelayerTypes,
} from "@walletconnect/types"
import React from "react"
import {
    BaseText,
    BaseButton,
    BaseView,
    BaseSpacer,
    showSuccessToast,
    useWalletConnect,
    BaseModal,
    showErrorToast,
} from "~Components"
import { getSdkError } from "@walletconnect/utils"
import {
    selectAccountsState,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { insertSession } from "~Storage/Redux/Slices"
import { error } from "~Common"

type Props = {
    currentProposal: SignClientTypes.EventArguments["session_proposal"]
    onClose: () => void
    isOpen: boolean
}

export const PairModal = ({ currentProposal, onClose, isOpen }: Props) => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectAccountsState)?.selectedAccount
    const { web3Wallet } = useWalletConnect()

    if (!selectedAccount) {
        onClose()
        showErrorToast("No account selected.")
        return <></>
    }

    // check if the DApp is connecting to Vechain
    if (!currentProposal?.params?.requiredNamespaces?.vechain) {
        onClose()
        showErrorToast(
            "The requested chain is not compatible with this wallet.",
        )
        return <></>
    }

    const name = currentProposal?.params?.proposer?.metadata?.name
    const url = currentProposal?.params?.proposer?.metadata.url
    const methods = currentProposal?.params?.requiredNamespaces.vechain.methods
    const events = currentProposal?.params?.requiredNamespaces.vechain.events
    const chains = currentProposal?.params?.requiredNamespaces.vechain.chains
    const icon = currentProposal?.params.proposer.metadata.icons[0]

    const handleAccept = async () => {
        if (!web3Wallet) {
            onClose()
            showErrorToast("Wallet connect not initialized.")
            return
        }

        const { id, params } = currentProposal
        const requiredNamespaces: ProposalTypes.RequiredNamespaces =
            params.requiredNamespaces
        const relays: RelayerTypes.ProtocolOptions[] = params.relays

        if (currentProposal && requiredNamespaces) {
            const namespaces: SessionTypes.Namespaces = {}

            Object.keys(requiredNamespaces).forEach(key => {
                const accounts: string[] = []

                requiredNamespaces[key].chains?.map((chain: string) => {
                    accounts.push(`${chain}:${selectedAccount}`)
                })

                namespaces[key] = {
                    accounts,
                    methods: requiredNamespaces[key].methods,
                    events: requiredNamespaces[key].events,
                }
            })

            let session: SessionTypes.Struct = await web3Wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            })

            dispatch(insertSession({ address: selectedAccount, session }))

            onClose()
            showSuccessToast('Successfully connected to "' + name + '"')
        }
    }

    async function handleReject() {
        const { id } = currentProposal

        if (currentProposal) {
            try {
                await web3Wallet?.rejectSession({
                    id,
                    reason: getSdkError("USER_REJECTED_METHODS"),
                })
            } catch (err: unknown) {
                error(err)
            } finally {
                onClose()
            }
        }
    }

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
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
                            <BaseText key={method + index}>{method}</BaseText>
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
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
})
