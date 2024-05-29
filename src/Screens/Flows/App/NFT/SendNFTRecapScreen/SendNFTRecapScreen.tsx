import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BaseSpacer,
    BaseView,
    DelegationView,
    FadeoutButton,
    GasFeeOptions,
    Layout,
    NFTTransferCard,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    addPendingNFTtransferTransactionActivity,
    selectAccounts,
    selectNFTWithAddressAndTokenId,
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { InfoSectionView } from "../NFTDetailScreen/Components"
import { useAnalyticTracking, useTransactionScreen, useTransferAddContact } from "~Hooks"
import { StackActions, useNavigation } from "@react-navigation/native"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { Transaction } from "thor-devkit"
import { AnalyticsEvent, creteAnalyticsEvent } from "~Constants"
import { ContactType, DEVICE_TYPE } from "~Model"
import { ContactManagementBottomSheet } from "../../ContactsScreen"
import { AccountUtils, AddressUtils } from "~Utils"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.SEND_NFT_RECAP>

export const SendNFTRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(state, route.params.contractAddress, route.params.tokenId),
    )

    const clauses = useMemo(
        () => prepareNonFungibleClause(selectedAccount.address, route.params.receiverAddress, nft),

        [selectedAccount, route.params.receiverAddress, nft],
    )

    const onFinish = useCallback(
        (success: boolean) => {
            if (success) {
                track(AnalyticsEvent.WALLET_OPERATION, {
                    ...creteAnalyticsEvent({
                        medium: AnalyticsEvent.SEND,
                        signature: AnalyticsEvent.LOCAL,
                        network: network.name,
                        subject: AnalyticsEvent.NFT,
                        context: AnalyticsEvent.SEND,
                    }),
                })
            }

            dispatch(setIsAppLoading(false))
            nav.dispatch(StackActions.popToTop())
        },
        [dispatch, nav, track, network.name],
    )

    const onTransactionSuccess = useCallback(
        (transaction: Transaction) => {
            dispatch(addPendingNFTtransferTransactionActivity(transaction))
            onFinish(true)
        },
        [onFinish, dispatch],
    )

    const onTransactionFailure = useCallback(() => onFinish(false), [onFinish])

    const {
        selectedDelegationOption,
        loadingGas,
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        selectedFeeOption,
        gasFeeOptions,
        setNoDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        isEnoughGas,
        txCostTotal,
        selectedDelegationAccount,
        selectedDelegationUrl,
        vtho,
        isDisabledButtonState,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.NFTS,
    })

    const { onAddContactPress, handleSaveContact, addContactSheet, selectedContactAddress, closeAddContactSheet } =
        useTransferAddContact()

    const accounts = useAppSelector(selectAccounts)
    const receiverAccount = accounts.find(_account =>
        AddressUtils.compareAddresses(_account.address, route.params.receiverAddress),
    )

    return (
        <Layout
            noStaticBottomPadding
            safeAreaTestID="Send_NFT_Recap_Screen"
            title={LL.RECAP()}
            body={
                <>
                    <BaseView mb={80}>
                        <TransferCard
                            fromAddress={selectedAccount.address}
                            toAddresses={[route.params.receiverAddress]}
                            onAddContactPress={onAddContactPress}
                            isFromAccountLedger={selectedAccount.device?.type === DEVICE_TYPE.LEDGER}
                            isToAccountLedger={
                                receiverAccount?.device && receiverAccount?.device.type === DEVICE_TYPE.LEDGER
                            }
                            isObservedWallet={
                                AccountUtils.isObservedAccount(receiverAccount) &&
                                receiverAccount?.type === DEVICE_TYPE.LOCAL_WATCHED
                            }
                        />

                        <BaseSpacer height={24} />

                        {nft && <NFTTransferCard collectionAddress={nft.address} tokenId={nft.tokenId} />}

                        <DelegationView
                            setNoDelegation={setNoDelegation}
                            selectedDelegationOption={selectedDelegationOption}
                            setSelectedDelegationAccount={setSelectedDelegationAccount}
                            selectedDelegationAccount={selectedDelegationAccount}
                            selectedDelegationUrl={selectedDelegationUrl}
                            setSelectedDelegationUrl={setSelectedDelegationUrl}
                        />

                        <BaseSpacer height={24} />

                        <InfoSectionView<React.JSX.Element>
                            isFontReverse
                            title={LL.ESTIMATED_GAS_FEE()}
                            data={
                                <GasFeeOptions
                                    setSelectedFeeOption={setSelectedFeeOption}
                                    selectedDelegationOption={selectedDelegationOption}
                                    loadingGas={loadingGas}
                                    selectedFeeOption={selectedFeeOption}
                                    gasFeeOptions={gasFeeOptions}
                                    isThereEnoughGas={isEnoughGas}
                                    totalBalance={vtho.balance.balance}
                                    txCostTotal={txCostTotal}
                                />
                            }
                        />

                        <InfoSectionView<string>
                            isFontReverse
                            title={LL.ESTIMATED_TIME()}
                            data={LL.SEND_LESS_THAN_1_MIN()}
                        />
                    </BaseView>
                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />
                    <ContactManagementBottomSheet
                        ref={addContactSheet}
                        contact={{
                            alias: "",
                            address: selectedContactAddress ?? "",
                            type: ContactType.KNOWN,
                        }}
                        onClose={closeAddContactSheet}
                        onSaveContact={handleSaveContact}
                        isAddingContact={true}
                        checkTouched={false}
                    />
                </>
            }
            footer={
                <FadeoutButton
                    testID="confirm-send-button"
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={onSubmit}
                    disabled={isDisabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}
