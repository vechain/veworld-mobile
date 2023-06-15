import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProposalTypes, RelayerTypes, SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, Image } from "react-native"
import {
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseText,
    BaseView,
    showErrorToast,
    showSuccessToast,
    BaseButton,
} from "~Components"
import { RequestMethods } from "~Constants"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { insertSession, useAppDispatch } from "~Storage/Redux"
import { WalletConnectUtils, error } from "~Utils"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECT_APP_SCREEN
>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal
    const web3Wallet = route.params.web3Wallet
    const selectedAccountAddress = route.params.selectedAccountAddress

    const nav = useNavigation()
    const dispatch = useAppDispatch()
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

    const handleAccept = useCallback(async () => {
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
                nav.navigate(Routes.SETTINGS_CONNECTED_APPS)
            } catch (err: unknown) {
                showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
                nav.goBack()
            }
        }
    }, [
        currentProposal,
        dispatch,
        LL,
        nav,
        selectedAccountAddress,
        web3Wallet,
        name,
    ])

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
                nav.goBack()
            }
        }
    }

    return (
        <BaseSafeArea>
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
                        method =>
                            method === RequestMethods.IDENTIFY ||
                            method === RequestMethods.SIGN,
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
                {/* <BaseSpacer height={50} />
                <BaseView style={styles.footer} mx={20}>
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={"CONNECT"}
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
                </BaseView> */}
            </BaseScrollView>
            <BaseView style={styles.footer} px={10}>
                <BaseButton
                    w={100}
                    haptics="light"
                    title={"CONNECT"}
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
        </BaseSafeArea>
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
    footer: {
        position: "absolute",
        bottom: 0,
        paddingBottom: 50,
        width: "100%",
        alignSelf: "center",
    },
    separator: {
        borderWidth: 0.5,
        borderColor: "#0B0043",
        opacity: 0.56,
    },
})
