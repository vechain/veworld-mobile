import { StackActions, useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import { default as React, useCallback, useMemo } from "react"
import {
    BaseSpacer,
    BaseView,
    DelegationView,
    FadeoutButton,
    GasFeeSpeed,
    Layout,
    NFTTransferCard,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { AnalyticsEvent, creteAnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useTransactionScreen, useTransferAddContact } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ContactType, DEVICE_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
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
import { AccountUtils, AddressUtils } from "~Utils"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { ContactManagementBottomSheet } from "../../ContactsScreen"

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
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        selectedFeeOption,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDisabledButtonState,
        gasOptions,
        gasUpdatedAt,
        isGalactica,
        isBaseFeeRampingUp,
        speedChangeEnabled,
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

                        <BaseSpacer height={24} />

                        <GasFeeSpeed
                            gasUpdatedAt={gasUpdatedAt}
                            options={gasOptions}
                            selectedFeeOption={selectedFeeOption}
                            setSelectedFeeOption={setSelectedFeeOption}
                            isGalactica={isGalactica}
                            isBaseFeeRampingUp={isBaseFeeRampingUp}
                            speedChangeEnabled={speedChangeEnabled}>
                            <DelegationView
                                setNoDelegation={resetDelegation}
                                selectedDelegationOption={selectedDelegationOption}
                                setSelectedDelegationAccount={setSelectedDelegationAccount}
                                selectedDelegationAccount={selectedDelegationAccount}
                                selectedDelegationUrl={selectedDelegationUrl}
                                setSelectedDelegationUrl={setSelectedDelegationUrl}
                            />
                        </GasFeeSpeed>
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
