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
import { AnalyticsEvent } from "~Constants"
import { useTransactionScreen, useTransferAddContact } from "~Hooks"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useI18nContext } from "~i18n"
import { ContactType, DEVICE_TYPE, NFTMediaType, NonFungibleToken } from "~Model"
import { Routes } from "~Navigation"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import {
    addPendingNFTtransferTransactionActivity,
    selectAccounts,
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, AddressUtils } from "~Utils"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { ContactManagementBottomSheet } from "../ContactsScreen"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.SEND_NFT_RECAP>

export const SendCollectibleRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const collectible = useCollectibleDetails({
        address: route.params.contractAddress,
        tokenId: route.params.tokenId,
    })

    const nft: NonFungibleToken = useMemo(() => {
        return {
            owner: selectedAccount.address,
            address: route.params.contractAddress,
            tokenId: route.params.tokenId.toString(),
            id: route.params.contractAddress,
            updated: false,
            name: collectible.name ?? "",
            description: collectible.description ?? "",
            image: collectible.image ?? "",
            mimeType: collectible.mimeType ?? "",
            mediaType: collectible.mediaType ?? NFTMediaType.IMAGE,
        }
    }, [
        selectedAccount,
        route.params.contractAddress,
        route.params.tokenId,
        collectible.name,
        collectible.description,
        collectible.image,
        collectible.mimeType,
        collectible.mediaType,
    ])

    const clauses = useMemo(
        () =>
            prepareNonFungibleClause(
                selectedAccount.address,
                route.params.receiverAddress,
                route.params.contractAddress,
                route.params.tokenId.toString(),
            ),
        [selectedAccount.address, route.params.receiverAddress, route.params.contractAddress, route.params.tokenId],
    )

    const onFinish = useCallback(() => {
        dispatch(setIsAppLoading(false))
        nav.dispatch(StackActions.popToTop())
    }, [dispatch, nav])

    const onTransactionSuccess = useCallback(
        (transaction: Transaction) => {
            dispatch(
                addPendingNFTtransferTransactionActivity(transaction, {
                    medium: AnalyticsEvent.SEND,
                    signature: AnalyticsEvent.LOCAL,
                    subject: AnalyticsEvent.NFT,
                    context: AnalyticsEvent.SEND,
                }),
            )
            onFinish()
        },
        [onFinish, dispatch],
    )

    const onTransactionFailure = useCallback(() => onFinish(), [onFinish])

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
        isEnoughGas,
        availableTokens,
        selectedDelegationToken,
        setSelectedDelegationToken,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
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
                            speedChangeEnabled={speedChangeEnabled}
                            isEnoughBalance={isEnoughGas}
                            availableDelegationTokens={availableTokens}
                            delegationToken={selectedDelegationToken}
                            setDelegationToken={setSelectedDelegationToken}
                            hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                            isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                            hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}>
                            <DelegationView
                                setNoDelegation={resetDelegation}
                                selectedDelegationOption={selectedDelegationOption}
                                setSelectedDelegationAccount={setSelectedDelegationAccount}
                                selectedDelegationAccount={selectedDelegationAccount}
                                selectedDelegationUrl={selectedDelegationUrl}
                                setSelectedDelegationUrl={setSelectedDelegationUrl}
                                delegationToken={selectedDelegationToken}
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
