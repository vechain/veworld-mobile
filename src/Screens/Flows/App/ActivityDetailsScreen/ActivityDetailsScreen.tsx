import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useState } from "react"
import { Linking } from "react-native"
import { getTimeZone } from "react-native-localize"
import {
    BaseSpacer,
    BaseText,
    FadeoutButton,
    Layout,
    NFTTransferCard,
    SwapCard,
    TransactionStatusBox,
    TransferCard,
} from "~Components"
import { useBottomSheetModal, useTransferAddContact } from "~Hooks"
import { HistoryStackParamList, Routes } from "~Navigation"
import { DateUtils, HexUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { getActivityTitle } from "./util"

import {
    ActivityStatus,
    ActivityType,
    B3trSwapB3trToVot3Activity,
    ConnectedAppActivity,
    ContactType,
    DappTxActivity,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    SwapActivity,
    TypedDataActivity,
} from "~Model"
import { selectActivity, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { ExplorerLinkType, getExplorerLink } from "~Utils/AddressUtils/AddressUtils"
import { ContactManagementBottomSheet } from "../ContactsScreen"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"
import {
    ConnectedAppDetails,
    DappTransactionDetails,
    FungibleTokenTransferDetails,
    NonFungibleTokenTransferDetails,
    SignCertificateDetails,
} from "./Components"
import TypedDataTransactionDetails from "./Components/TypedDataTransactionDetails"
import { getTransaction } from "~Networking"
import { useQuery } from "@tanstack/react-query"
import { B3TR, VOT3 } from "~Constants"

type Props = NativeStackScreenProps<HistoryStackParamList, Routes.ACTIVITY_DETAILS>

export const ActivityDetailsScreen = ({ route, navigation }: Props) => {
    const { activity, token, isSwap } = route.params

    const network = useAppSelector(selectSelectedNetwork)

    const { LL, locale } = useI18nContext()

    const [customTokenAddress, setCustomTokenAddress] = useState<string>()

    const activityFromStore = useAppSelector(state => selectActivity(state, activity.id))

    const queryFn = useCallback(async () => {
        return await getTransaction(activity.txId ?? "", network)
    }, [activity.txId, network])

    const {
        data: transaction,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["acitivityBox", activity.txId, network.type],
        queryFn: queryFn,
        enabled: !!activity.txId,
    })

    const isloadingTxDetails = isLoading || isFetching

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const { onAddContactPress, handleSaveContact, addContactSheet, selectedContactAddress, closeAddContactSheet } =
        useTransferAddContact()

    const swapResult = useMemo(() => {
        if (!isSwap) return undefined

        let paidTokenAddress, paidAmount, receivedTokenAddress, receivedAmount

        switch (activity.type) {
            case ActivityType.B3TR_SWAP_B3TR_TO_VOT3: {
                paidTokenAddress = B3TR.address
                paidAmount = (activity as B3trSwapB3trToVot3Activity).value
                receivedTokenAddress = VOT3.address
                receivedAmount = (activity as B3trSwapB3trToVot3Activity).value
                break
            }
            case ActivityType.B3TR_SWAP_VOT3_TO_B3TR: {
                paidTokenAddress = VOT3.address
                paidAmount = (activity as B3trSwapB3trToVot3Activity).value
                receivedTokenAddress = B3TR.address
                receivedAmount = (activity as B3trSwapB3trToVot3Activity).value
                break
            }
            default: {
                const { inputToken, inputValue, outputToken, outputValue } = activity as SwapActivity
                paidTokenAddress = outputToken
                paidAmount = outputValue
                receivedTokenAddress = inputToken
                receivedAmount = inputValue
            }
        }

        return {
            paidTokenAddress,
            paidAmount,
            receivedTokenAddress,
            receivedAmount,
        }
    }, [activity, isSwap])

    const dateTimeActivity = useMemo(() => {
        return DateUtils.formatDateTime(activity.timestamp ?? 0, locale, getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE)
    }, [activity.timestamp, locale])

    const isPendingOrFailedActivity = useMemo(() => {
        return !!transaction?.reverted
    }, [transaction?.reverted])

    const isNFTtransfer = useMemo(() => {
        return activity.type === ActivityType.TRANSFER_NFT
    }, [activity.type])

    const explorerUrl = useMemo(() => {
        if (activity.txId)
            return `${getExplorerLink(network, ExplorerLinkType.TRANSACTION)}/${HexUtils.addPrefix(activity.txId)}`
    }, [activity, network])

    const renderActivityDetails = useMemo(() => {
        switch (activity.type) {
            case ActivityType.TRANSFER_FT:
            case ActivityType.TRANSFER_VET:
            case ActivityType.TRANSFER_SF: {
                return (
                    <FungibleTokenTransferDetails
                        activity={(activityFromStore ?? activity) as FungibleTokenActivity}
                        token={token}
                        gasUsed={transaction?.gasUsed}
                        isLoading={isloadingTxDetails}
                    />
                )
            }
            case ActivityType.B3TR_SWAP_B3TR_TO_VOT3:
            case ActivityType.B3TR_SWAP_VOT3_TO_B3TR:
            case ActivityType.B3TR_ACTION:
            case ActivityType.B3TR_CLAIM_REWARD:
            case ActivityType.B3TR_PROPOSAL_SUPPORT:
            case ActivityType.B3TR_PROPOSAL_VOTE:
            case ActivityType.B3TR_UPGRADE_GM:
            case ActivityType.B3TR_XALLOCATION_VOTE:
            case ActivityType.SWAP_FT_TO_FT:
            case ActivityType.SWAP_FT_TO_VET:
            case ActivityType.SWAP_VET_TO_FT:
            case ActivityType.DAPP_TRANSACTION: {
                return (
                    <DappTransactionDetails
                        activity={(activityFromStore ?? activity) as DappTxActivity}
                        clauses={transaction?.clauses}
                        status={isPendingOrFailedActivity ? ActivityStatus.REVERTED : ActivityStatus.SUCCESS}
                        gasUsed={transaction?.gasUsed}
                        isLoading={isloadingTxDetails}
                    />
                )
            }
            case ActivityType.TRANSFER_NFT: {
                return (
                    <NonFungibleTokenTransferDetails
                        activity={(activityFromStore ?? activity) as NonFungibleTokenActivity}
                        gasUsed={transaction?.gasUsed}
                        isLoading={isloadingTxDetails}
                    />
                )
            }
            case ActivityType.CONNECTED_APP_TRANSACTION: {
                return <ConnectedAppDetails activity={(activityFromStore ?? activity) as ConnectedAppActivity} />
            }
            case ActivityType.SIGN_CERT: {
                return <SignCertificateDetails activity={(activityFromStore ?? activity) as SignCertActivity} />
            }
            case ActivityType.SIGN_TYPED_DATA: {
                return <TypedDataTransactionDetails activity={(activityFromStore ?? activity) as TypedDataActivity} />
            }
            default:
                return <></>
        }
    }, [
        activity,
        activityFromStore,
        isPendingOrFailedActivity,
        isloadingTxDetails,
        token,
        transaction?.clauses,
        transaction?.gasUsed,
    ])

    const onGoBack = useCallback(() => {
        navigation.navigate(Routes.HISTORY)
    }, [navigation])

    const onAddCustomToken = useCallback(
        (tokenAddress: string) => {
            setCustomTokenAddress(tokenAddress)

            openAddCustomTokenSheet()
        },
        [openAddCustomTokenSheet],
    )

    return (
        <>
            <Layout
                safeAreaTestID="Activity_Details_Screen"
                noStaticBottomPadding
                title={getActivityTitle(activity, LL)}
                onGoBack={onGoBack}
                body={
                    <>
                        <BaseText typographyFont="subSubTitleLight">{dateTimeActivity}</BaseText>

                        <BaseSpacer height={16} />

                        {isPendingOrFailedActivity && (
                            <>
                                <TransactionStatusBox status={ActivityStatus.REVERTED} />
                                <BaseSpacer height={16} />
                            </>
                        )}

                        {/* Transfer card shows the Address/Addresses involved in the given activity */}
                        {isSwap && swapResult ? (
                            <SwapCard
                                paidTokenAddress={swapResult.paidTokenAddress}
                                paidTokenAmount={swapResult.paidAmount}
                                receivedTokenAddress={swapResult.receivedTokenAddress}
                                receivedTokenAmount={swapResult.receivedAmount}
                                onAddCustomToken={onAddCustomToken}
                            />
                        ) : (
                            activity.from && (
                                <TransferCard
                                    fromAddress={activity.from}
                                    toAddresses={[...new Set(activity.to)]}
                                    onAddContactPress={onAddContactPress}
                                />
                            )
                        )}

                        <BaseSpacer height={20} />

                        {isNFTtransfer && (
                            <>
                                <NFTTransferCard
                                    collectionAddress={(activity as NonFungibleTokenActivity).contractAddress}
                                    tokenId={(activity as NonFungibleTokenActivity).tokenId}
                                />

                                <BaseSpacer height={20} />
                            </>
                        )}

                        <BaseText typographyFont="subTitleBold">{LL.DETAILS()}</BaseText>

                        <BaseSpacer height={2} />

                        {/* Render Activity Details based on the 'activity.type' */}
                        {renderActivityDetails}

                        <BaseSpacer height={88} />
                    </>
                }
                footer={
                    explorerUrl && (
                        <FadeoutButton
                            testID="view-on-explorer-button"
                            title={LL.VIEW_ON_EXPLORER().toUpperCase()}
                            action={() => {
                                Linking.openURL(explorerUrl)
                            }}
                            bottom={0}
                            mx={0}
                            width={"auto"}
                        />
                    )
                }
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

            <AddCustomTokenBottomSheet
                ref={addCustomTokenSheetRef}
                onClose={closeAddCustomTokenSheet}
                tokenAddress={customTokenAddress}
            />
        </>
    )
}
