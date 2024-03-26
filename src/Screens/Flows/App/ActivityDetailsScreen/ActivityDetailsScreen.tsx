import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    BaseSpacer,
    BaseText,
    SwapCard,
    FadeoutButton,
    TransferCard,
    TransactionStatusBox,
    NFTTransferCard,
    Layout,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { Linking } from "react-native"
import { useBottomSheetModal, useTransferAddContact } from "~Hooks"
import { DateUtils, HexUtils, TransactionUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { getActivityTitle } from "./util"
import { getTimeZone } from "react-native-localize"

import {
    ActivityStatus,
    ActivityType,
    DappTxActivity,
    ContactType,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    ConnectedAppActivity,
} from "~Model"
import {
    FungibleTokenTransferDetails,
    SignCertificateDetails,
    DappTransactionDetails,
    NonFungibleTokenTransferDetails,
    ConnectedAppDetails,
} from "./Components"
import { ContactManagementBottomSheet } from "../ContactsScreen"
import { selectActivity, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"
import { ExplorerLinkType, getExplorerLink } from "~Utils/AddressUtils/AddressUtils"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.ACTIVITY_DETAILS>

export const ActivityDetailsScreen = ({ route }: Props) => {
    const { activity, token, isSwap, decodedClauses } = route.params

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
        if (!isSwap || !decodedClauses || activity.type !== ActivityType.DAPP_TRANSACTION) return undefined

        return TransactionUtils.decodeSwapTransferAmounts(decodedClauses, activity as DappTxActivity)
    }, [activity, decodedClauses, isSwap])

    const dateTimeActivity = useMemo(() => {
        return DateUtils.formatDateTime(activity.timestamp ?? 0, locale, getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE)
    }, [activity.timestamp, locale])

    const isPendingOrFailedActivity = useMemo(() => {
        return activityFromStore
            ? activityFromStore.status !== ActivityStatus.SUCCESS
            : activity.status !== ActivityStatus.SUCCESS
    }, [activity, activityFromStore])

    const isNFTtransfer = useMemo(() => {
        return activity.type === ActivityType.NFT_TRANSFER
    }, [activity.type])

    const explorerUrl = useMemo(() => {
        if (activity.isTransaction && activity.txId)
            return `${getExplorerLink(network, ExplorerLinkType.TRANSACTION)}/${HexUtils.addPrefix(activity.txId)}`
    }, [activity, network])

    const renderActivityDetails = useMemo(() => {
        switch (activity.type) {
            case ActivityType.FUNGIBLE_TOKEN:
            case ActivityType.VET_TRANSFER: {
                return (
                    <FungibleTokenTransferDetails
                        activity={(activityFromStore ?? activity) as FungibleTokenActivity}
                        token={token}
                    />
                )
            }
            case ActivityType.SIGN_CERT: {
                return <SignCertificateDetails activity={(activityFromStore ?? activity) as SignCertActivity} />
            }
            case ActivityType.DAPP_TRANSACTION: {
                return <DappTransactionDetails activity={(activityFromStore ?? activity) as DappTxActivity} />
            }
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
            default:
                return <></>
        }
    }, [activity, activityFromStore, token])

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
