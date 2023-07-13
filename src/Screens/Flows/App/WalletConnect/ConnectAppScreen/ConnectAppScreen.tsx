import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProposalTypes, RelayerTypes, SessionTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import React, { FC, useCallback } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    showErrorToast,
    showSuccessToast,
    BaseButton,
    SelectAccountBottomSheet,
    AccountCard,
    CloseModalButton,
    useWalletConnect,
} from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { AccountWithDevice, NETWORK_TYPE } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    addConnectedAppActivity,
    insertSession,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { WalletConnectUtils, error } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests } from "./Components"
import { AppInfo } from "../Components"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECT_APP_SCREEN
>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { web3Wallet } = useWalletConnect()

    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()
    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { name, url, methods, icon, description } =
        WalletConnectUtils.getPairAttributes(currentProposal)

    /**
     * Handle session proposal
     */
    const handleAccept = useCallback(async () => {
        const { id, params } = currentProposal

        const requiredNamespaces: ProposalTypes.RequiredNamespaces =
            params.requiredNamespaces
        const relays: RelayerTypes.ProtocolOptions[] = params.relays

        if (!web3Wallet) {
            showErrorToast(LL.NOTIFICATION_wallet_connect_not_initialized())
            return
        }

        if (!currentProposal || !requiredNamespaces) {
            showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
            return
        }

        // Setup vechain namespaces to return to the dapp
        const namespaces: SessionTypes.Namespaces = {}
        const connectedAccounts: string[] = []
        requiredNamespaces.vechain.chains?.map((scope: string) => {
            // Valid only for supported networks
            // scope example: vechain:main, vechain:test
            if (
                NETWORK_TYPE.MAIN.includes(scope.split(":")[1]) ||
                NETWORK_TYPE.TEST.includes(scope.split(":")[1])
            ) {
                connectedAccounts.push(`${scope}:${selectedAccount.address}`)
            }
        })

        namespaces.vechain = {
            accounts: connectedAccounts,
            methods: requiredNamespaces.vechain.methods,
            events: requiredNamespaces.vechain.events,
        }

        // Doing this nav.navigate before approveSession because after approveSession the DApp
        // is IMMEDIATELY sending a session_proposal and the nav.navigate is
        // closing the session proposal screen instead of this one
        nav.navigate(Routes.SETTINGS_CONNECTED_APPS)

        try {
            let session: SessionTypes.Struct = await web3Wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            })

            dispatch(
                insertSession({
                    address: selectedAccount.address,
                    session,
                }),
            )

            dispatch(addConnectedAppActivity(name, url, description, methods))

            showSuccessToast(
                LL.NOTIFICATION_wallet_connect_successfull_connection({
                    name,
                }),
            )
        } catch (err: unknown) {
            error(err)
            showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
        }
    }, [
        currentProposal,
        web3Wallet,
        nav,
        LL,
        selectedAccount.address,
        dispatch,
        name,
        url,
        description,
        methods,
    ])

    /**
     * Handle session rejection
     */
    const handleReject = useCallback(async () => {
        if (currentProposal) {
            const { id } = currentProposal

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
    }, [currentProposal, nav, web3Wallet])

    const onPressBack = useCallback(async () => {
        await handleReject()
        nav.goBack()
    }, [nav, handleReject])

    return (
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onPressBack} />
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {LL.CONNECTED_APP_TITLE()}
                    </BaseText>

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APP_REQUEST()}
                    </BaseText>

                    <BaseSpacer height={16} />
                    <AppInfo
                        name={name}
                        url={url}
                        icon={icon}
                        description={description}
                    />

                    <BaseSpacer height={30} />
                    <AppConnectionRequests name={name} methods={methods} />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">
                        {LL.COMMON_SELECT_ACCOUNT()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        onPress={openSelectAccountBottomSheet}
                        showSelectAccountIcon={true}
                    />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={LL.COMMON_BTN_CONNECT()}
                        action={handleAccept}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        variant="outline"
                        title={LL.COMMON_BTN_CANCEL_CAPS_LOCK()}
                        action={handleReject}
                    />
                </BaseView>
            </ScrollView>

            <SelectAccountBottomSheet
                closeBottomSheet={closeSelectAccountBottonSheet}
                accounts={visibleAccounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBottomSheetRef}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
