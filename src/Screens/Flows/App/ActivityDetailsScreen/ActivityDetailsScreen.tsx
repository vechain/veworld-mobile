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

type Props = NativeStackScreenProps<HistoryStackParamList, Routes.ACTIVITY_DETAILS>

export const ActivityDetailsScreen = ({ route, navigation }: Props) => {
    const { activity, token, isSwap } = route.params

    const network = useAppSelector(selectSelectedNetwork)

    const { LL, locale } = useI18nContext()

    const [customTokenAddress, setCustomTokenAddress] = useState<string>()

    const activityFromStore = useAppSelector(state => selectActivity(state, activity.id))

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const { onAddContactPress, handleSaveContact, addContactSheet, selectedContactAddress, closeAddContactSheet } =
        useTransferAddContact()

    const swapResult = useMemo(() => {
        if (!isSwap) return undefined

        const { inputToken, inputValue, outputToken, outputValue } = activity as SwapActivity

        return {
            paidTokenAddress: outputToken,
            paidAmount: outputValue,
            receivedTokenAddress: inputToken,
            receivedAmount: inputValue,
        }
    }, [activity, isSwap])

    const dateTimeActivity = useMemo(() => {
        return DateUtils.formatDateTime(activity.timestamp ?? 0, locale, getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE)
    }, [activity.timestamp, locale])

    const isPendingOrFailedActivity = useMemo(() => {
        return activityFromStore
            ? activityFromStore.status !== ActivityStatus.SUCCESS
            : activity.status !== ActivityStatus.SUCCESS
    }, [activity, activityFromStore])

    const isNFTtransfer = useMemo(() => {
        return activity.type === ActivityType.NFT_TRANSFER || activity.type === ActivityType.TRANSFER_NFT
    }, [activity.type])

    const explorerUrl = useMemo(() => {
        if (activity.isTransaction && activity.txId)
            return `${getExplorerLink(network, ExplorerLinkType.TRANSACTION)}/${HexUtils.addPrefix(activity.txId)}`
    }, [activity, network])

    const renderActivityDetails = useMemo(() => {
        switch (activity.type) {
            case ActivityType.TRANSFER_FT:
            case ActivityType.TRANSFER_VET:
            case ActivityType.TRANSFER_SF:
            case ActivityType.FUNGIBLE_TOKEN:
            case ActivityType.VET_TRANSFER: {
                return (
                    <FungibleTokenTransferDetails
                        activity={(activityFromStore ?? activity) as FungibleTokenActivity}
                        token={token}
                    />
                )
            }
            case ActivityType.SWAP_FT_TO_FT:
            case ActivityType.SWAP_FT_TO_VET:
            case ActivityType.SWAP_VET_TO_FT:
            case ActivityType.DAPP_TRANSACTION: {
                return <DappTransactionDetails activity={(activityFromStore ?? activity) as DappTxActivity} />
            }
            case ActivityType.TRANSFER_NFT:
            case ActivityType.NFT_TRANSFER: {
                return (
                    <NonFungibleTokenTransferDetails
                        activity={(activityFromStore ?? activity) as NonFungibleTokenActivity}
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
    }, [activity, activityFromStore, token])

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
                title={getActivityTitle(activity, LL, isSwap)}
                onGoBack={onGoBack}
                body={
                    <>
                        <BaseText typographyFont="subSubTitleLight">{dateTimeActivity}</BaseText>

                        <BaseSpacer height={16} />

                        {isPendingOrFailedActivity && (
                            <>
                                <TransactionStatusBox
                                    status={activityFromStore?.status ?? activity.status ?? ActivityStatus.SUCCESS}
                                />
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

                        <BaseSpacer height={72} />
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
