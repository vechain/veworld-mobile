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
import { AccountWithDevice } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    insertSession,
    selectAccount,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { WalletConnectUtils, error } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests, AppInfo } from "./Components"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECT_APP_SCREEN
>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal
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
        dispatch(selectAccount({ address: account.address }))
    }

    const { name, url, methods, icon, description } =
        WalletConnectUtils.getPairAttributes(currentProposal)

    /**
     * Handle session proposal
     * 1) Approve session
     * 2) Insert session into redux
     * 3) Show success toast
     * 4) Navigate to connected apps screen
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

        const namespaces: SessionTypes.Namespaces = {}

        Object.keys(requiredNamespaces).forEach(key => {
            const accounts: string[] = []

            requiredNamespaces[key].chains?.map((chain: string) => {
                accounts.push(`${chain}:${selectedAccount.address}`)
            })

            namespaces[key] = {
                accounts,
                methods: requiredNamespaces[key].methods,
                events: requiredNamespaces[key].events,
            }
        })

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

            showSuccessToast(
                LL.NOTIFICATION_wallet_connect_successfull_connection({
                    name,
                }),
            )
            nav.navigate(Routes.SETTINGS_CONNECTED_APPS)
        } catch (err: unknown) {
            error(err)
            showErrorToast(LL.NOTIFICATION_wallet_connect_error_pairing())
            nav.goBack()
        }
    }, [currentProposal, dispatch, LL, nav, web3Wallet, name, selectedAccount])

    /**
     * Handle session rejection
     * 1) Reject session
     * 2) Go back
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
            <CloseModalButton onPress={onPressBack} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
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
        height: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
