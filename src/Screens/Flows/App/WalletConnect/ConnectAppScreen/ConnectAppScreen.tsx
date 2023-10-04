import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { FC, useCallback, useEffect, useMemo } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    AccountCard,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    SelectAccountBottomSheet,
    showInfoToast,
    useWcProposal,
} from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { AccountWithDevice } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    changeSelectedNetwork,
    selectNetworks,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { HexUtils, WalletConnectUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { AppConnectionRequests, AppInfo, UnknownAppMessage } from "~Screens"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECT_APP_SCREEN
>

export const ConnectAppScreen: FC<Props> = ({ route }: Props) => {
    const currentProposal = route.params.sessionProposal

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const networks = useAppSelector(selectNetworks)

    const { processProposal, rejectProposal } = useWcProposal(currentProposal)

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const { name, url, methods, icon, description, chains } = useMemo(
        () => WalletConnectUtils.getPairAttributes(currentProposal),
        [currentProposal],
    )

    /**
     * If the dApp requests ONLY one chain, switch to that chain
     */
    useEffect(() => {
        if (chains && chains.length === 1) {
            const requestedChain = chains[0]

            const requestedNetwork = networks.find(net =>
                HexUtils.compare(
                    net.genesis.id.slice(-32),
                    requestedChain.split(":")[1],
                ),
            )

            if (requestedNetwork) {
                dispatch(changeSelectedNetwork(requestedNetwork))
                showInfoToast({
                    text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                        network: requestedNetwork.name,
                    }),
                })
            }
        }
    }, [networks, LL, dispatch, chains])

    const onPressBack = useCallback(async () => {
        await rejectProposal(currentProposal)
        nav.goBack()
    }, [currentProposal, nav, rejectProposal])

    const isConfirmDisabled = useMemo(() => {
        const { validation } = currentProposal.verifyContext.verified

        if (validation === "UNKNOWN" && !isInvalidChecked) {
            return true
        }

        return validation === "INVALID"
    }, [currentProposal, isInvalidChecked])

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

                    <UnknownAppMessage
                        verifyContext={currentProposal.verifyContext}
                        confirmed={isInvalidChecked}
                        setConfirmed={setInvalidChecked}
                    />
                </BaseView>

                <BaseView mx={20}>
                    <BaseSpacer height={24} />
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_CONNECT()}
                        action={processProposal}
                        disabled={isConfirmDisabled}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="Light"
                        variant="outline"
                        title={LL.COMMON_BTN_CANCEL_CAPS_LOCK()}
                        action={() => rejectProposal(currentProposal)}
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
