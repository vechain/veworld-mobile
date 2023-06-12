import { Image, StyleSheet } from "react-native"
import {
    SessionTypes,
    SignClientTypes,
    ProposalTypes,
    RelayerTypes,
} from "@walletconnect/types"
import React, { useMemo } from "react"
import {
    BaseText,
    BaseButton,
    BaseView,
    BaseSpacer,
    showSuccessToast,
    useWalletConnect,
    BaseModal,
    showErrorToast,
    CloseModalButton,
    BaseScrollView,
} from "~Components"
import { getSdkError } from "@walletconnect/utils"
import {
    selectSelectedAccountAddress,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { insertSession } from "~Storage/Redux/Slices"
import { error } from "~Utils/Logger"
import { WalletConnectUtils } from "~Utils"
import { useI18nContext } from "~i18n"

type Props = {
    currentProposal: SignClientTypes.EventArguments["session_proposal"]
    onClose: (success: boolean) => void
    isOpen: boolean
}

export const PairModal = ({ currentProposal, onClose, isOpen }: Props) => {
    const dispatch = useAppDispatch()
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)
    const { web3Wallet } = useWalletConnect()
    const { LL } = useI18nContext()

    const { name, url, methods, chains, icon } =
        WalletConnectUtils.getPairAttributes(currentProposal)

    const chainsToConnect = useMemo(() => {
        let string = ""
        chains?.forEach((chain, index) => {
            if (index > 0) {
                string += " and "
            }
            string += chain.split(":")[1]
        })
        return string
    }, [chains])

    if (!selectedAccountAddress) {
        onClose(false)
        return <></>
    }

    // check if the DApp is connecting to Vechain
    if (!currentProposal.params.requiredNamespaces.vechain) {
        onClose(false)
        showErrorToast(LL.NOTIFICATION_wallet_connect_incompatible_dapp())
        return <></>
    }

    const handleAccept = async () => {
        if (!web3Wallet) {
            onClose(false)
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

            try {
                let session: SessionTypes.Struct =
                    await web3Wallet.approveSession({
                        id,
                        relayProtocol: relays[0].protocol,
                        namespaces,
                    })

                dispatch(
                    insertSession({ address: selectedAccountAddress, session }),
                )

                showSuccessToast(
                    LL.NOTIFICATION_wallet_connect_successfull_connection({
                        name,
                    }),
                )
                onClose(true)
            } catch (err: unknown) {
                showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
                onClose(true)
            }
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
                onClose(false)
            }
        }
    }

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={() => onClose(false)}
            animationType="fade"
            presentationStyle="overFullScreen">
            <CloseModalButton onPress={onClose} />

            <BaseScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {"Connect to app"}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <BaseText typographyFont="subSubTitleLight">
                        {name + " wants to connect to your wallet"}
                    </BaseText>

                    <BaseSpacer height={24} />
                    <Image
                        style={styles.dappLogo}
                        source={{
                            uri: icon,
                        }}
                    />
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">{name}</BaseText>
                    <BaseSpacer height={8} />
                    <BaseText>{url}</BaseText>

                    <BaseSpacer height={30} />
                    <BaseView style={styles.separator} />

                    <BaseSpacer height={30} />
                    <BaseText typographyFont="subTitle">
                        {"Connection request"}
                    </BaseText>

                    <BaseSpacer height={15} />
                    <BaseText>{name + " is asking for access to:"}</BaseText>

                    <BaseSpacer height={8} />
                    <BaseText>
                        {"\u25CF Connect to Vechain " +
                            chainsToConnect +
                            " network"}
                    </BaseText>

                    {methods.find(
                        method => method === "request_transaction",
                    ) && (
                        <>
                            <BaseSpacer height={8} />
                            <BaseText>
                                {
                                    "\u25CF Request transactions to send to Vechain Thor"
                                }
                            </BaseText>
                        </>
                    )}
                    {methods.find(
                        method => method === "identify" || method === "sign",
                    ) && (
                        <>
                            <BaseSpacer height={8} />
                            <BaseText>
                                {
                                    "\u25CF Request your signature on certificates or identification and agreements"
                                }
                            </BaseText>
                        </>
                    )}
                </BaseView>

                <BaseSpacer height={80} />

                <BaseView style={styles.footer} mx={20}>
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={"APPROVE"}
                        action={handleAccept}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        variant="outline"
                        title={"REJECT"}
                        action={handleReject}
                    />
                </BaseView>
            </BaseScrollView>
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginVertical: 4,
    },
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
        height: "100%",
    },
    scrollView: {
        width: "100%",
    },
    footer: {},
    separator: {
        borderWidth: 0.5,
        borderColor: "#0B0043",
        opacity: 0.56,
    },
})
