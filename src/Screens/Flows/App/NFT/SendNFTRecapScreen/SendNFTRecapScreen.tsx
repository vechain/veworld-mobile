import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    BaseSpacer,
    BaseView,
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
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { InfoSectionView } from "../NFTDetailScreen/Components"
import {
    useAnalyticTracking,
    useTransactionScreen,
    useTransferAddContact,
} from "~Hooks"
import { StackActions, useNavigation } from "@react-navigation/native"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { Transaction } from "thor-devkit"
import { AnalyticsEvent } from "~Constants"
import { ContactType, DEVICE_TYPE } from "~Model"
import { ContactManagementBottomSheet } from "../../ContactsScreen"
import { AddressUtils } from "~Utils"

type Props = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.SEND_NFT_RECAP
>

export const SendNFTRecapScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(
            state,
            route.params.contractAddress,
            route.params.tokenId,
        ),
    )

    const clauses = useMemo(
        () =>
            prepareNonFungibleClause(
                selectedAccount.address,
                route.params.receiverAddress,
                nft,
            ),

        [selectedAccount, route.params.receiverAddress, nft],
    )

    const onFinish = useCallback(
        (success: boolean) => {
            if (success) track(AnalyticsEvent.SEND_NFT_SENT)
            else track(AnalyticsEvent.SEND_NFT_FAILED_TO_SEND)

            dispatch(setIsAppLoading(false))
            nav.dispatch(StackActions.popToTop())
        },
        [track, dispatch, nav],
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
        Delegation,
        RenderGas,
        SubmitButton,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.HOME,
    })

    const {
        onAddContactPress,
        handleSaveContact,
        addContactSheet,
        selectedContactAddress,
        closeAddContactSheet,
    } = useTransferAddContact()

    const accounts = useAppSelector(selectAccounts)
    const receiverAccount = accounts.find(_account =>
        AddressUtils.compareAddresses(
            _account.address,
            route.params.receiverAddress,
        ),
    )

    return (
        <Layout
            noStaticBottomPadding
            safeAreaTestID="Send_NFT_Recap_Screen"
            showSelectedNetwork
            title={LL.RECAP()}
            body={
                <>
                    <BaseView mb={80}>
                        <TransferCard
                            fromAddress={selectedAccount.address}
                            toAddresses={[route.params.receiverAddress]}
                            onAddContactPress={onAddContactPress}
                            isFromAccountLedger={
                                selectedAccount.device?.type ===
                                DEVICE_TYPE.LEDGER
                            }
                            isToAccountLedger={
                                receiverAccount?.device.type ===
                                DEVICE_TYPE.LEDGER
                            }
                        />

                        <BaseSpacer height={24} />

                        {nft && (
                            <NFTTransferCard
                                collectionAddress={nft.address}
                                tokenId={nft.tokenId}
                            />
                        )}

                        {Delegation()}

                        <BaseSpacer height={24} />

                        <InfoSectionView<React.JSX.Element>
                            isFontReverse
                            title={LL.ESTIMATED_GAS_FEE()}
                            data={RenderGas()}
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
            footer={SubmitButton()}
        />
    )
}
