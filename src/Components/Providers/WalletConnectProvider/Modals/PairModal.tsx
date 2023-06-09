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
    selectSelectedAccountAddress,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { insertSession } from "~Storage/Redux/Slices"
import { error } from "~Common"
import { WalletConnectUtils } from "~Utils"
import { useI18nContext } from "~i18n"

type Props = {
    currentProposal: SignClientTypes.EventArguments["session_proposal"]
    onClose: () => void
    isOpen: boolean
}

export const PairModal = ({ currentProposal, onClose, isOpen }: Props) => {
    const dispatch = useAppDispatch()
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const { web3Wallet } = useWalletConnect()
    const { LL } = useI18nContext()

    if (!selectedAccountAddress) {
        onClose()
        return <></>
    }

    // check if the DApp is connecting to Vechain
    if (!currentProposal.params.requiredNamespaces.vechain) {
        onClose()
        showErrorToast(LL.NOTIFICATION_wallet_connect_incompatible_dapp())
        return <></>
    }

    const { name, url, methods, events, chains, icon } =
        WalletConnectUtils.getPairAttributes(currentProposal)

    const handleAccept = async () => {
        if (!web3Wallet) {
            onClose()
            showErrorToast(LL.NOTIFICATION_wallet_connect_not_initialized())
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
                    accounts.push(`${chain}:${selectedAccountAddress}`)
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

            dispatch(
                insertSession({ address: selectedAccountAddress, session }),
            )

            onClose()
            showSuccessToast(
                LL.NOTIFICATION_wallet_connect_successfull_connection({ name }),
            )
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
