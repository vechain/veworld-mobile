import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    SwapCard,
    FadeoutButton,
    TransferCard,
    TransactionStatusBox,
    BackButtonHeader,
    NFTTransferCard,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { ScrollView, StyleSheet } from "react-native"
import { useBottomSheetModal, usePlatformBottomInsets } from "~Hooks"
import { DateUtils, TransactionUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { getActivityTitle } from "./util"
import { getCalendars } from "expo-localization"
import {
    ActivityStatus,
    ActivityType,
    DappTxActivity,
    ContactType,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    ConnectedAppTxActivity,
} from "~Model"
import {
    FungibleTokenTransferDetails,
    SignCertificateDetails,
    DappTransactionDetails,
    NonFungibleTokenTransferDetails,
    ConnectedAppDetails,
} from "./Components"
import { ContactManagementBottomSheet } from "../ContactsScreen"
import { addContact } from "~Storage/Redux/Actions/Contacts"
import { selectActivity, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { AddCustomTokenBottomSheet } from "../ManageCustomTokenScreen/BottomSheets"

type Props = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.ACTIVITY_DETAILS
>

export const ActivityDetailsScreen = ({ route }: Props) => {
    const { activity, token, isSwap, decodedClauses } = route.params

    const { calculateBottomInsets } = usePlatformBottomInsets()

    const { LL, locale } = useI18nContext()

    const dispatch = useAppDispatch()

    const [selectedContactAddress, setSelectedContactAddress] =
        useState<string>()

    const [customTokenAddress, setCustomTokenAddress] = useState<string>()

    const activityFromStore = useAppSelector(state =>
        selectActivity(state, activity.id),
    )

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const {
        ref: addContactSheet,
        onOpen: openAddContactSheet,
        onClose: closeAddContactSheet,
    } = useBottomSheetModal()

    const swapResult = useMemo(() => {
        if (
            !isSwap ||
            !decodedClauses ||
            activity.type !== ActivityType.DAPP_TRANSACTION
        )
            return undefined

        return TransactionUtils.decodeSwapTransferAmounts(
            decodedClauses,
            activity as DappTxActivity,
        )
    }, [activity, decodedClauses, isSwap])

    const dateTimeActivity = useMemo(() => {
        return DateUtils.formatDateTime(
            activity.timestamp ?? 0,
            locale,
            getCalendars()[0].timeZone ?? DateUtils.DEFAULT_TIMEZONE,
        )
    }, [activity.timestamp, locale])

    const isPendingOrFailedActivity = useMemo(() => {
        return activityFromStore
            ? activityFromStore.status !== ActivityStatus.SUCCESS
            : activity.status !== ActivityStatus.SUCCESS
    }, [activity, activityFromStore])

    const isNFTtransfer = useMemo(() => {
        return activity.type === ActivityType.NFT_TRANSFER
    }, [activity.type])

    const renderActivityDetails = useMemo(() => {
        switch (activity.type) {
            case ActivityType.FUNGIBLE_TOKEN:
            case ActivityType.VET_TRANSFER: {
                return (
                    <FungibleTokenTransferDetails
                        activity={
                            (activityFromStore ??
                                activity) as FungibleTokenActivity
                        }
                        token={token}
                    />
                )
            }
            case ActivityType.SIGN_CERT: {
                return (
                    <SignCertificateDetails
                        activity={
                            (activityFromStore ?? activity) as SignCertActivity
                        }
                    />
                )
            }
            case ActivityType.DAPP_TRANSACTION: {
                return (
                    <DappTransactionDetails
                        activity={
                            (activityFromStore ?? activity) as DappTxActivity
                        }
                    />
                )
            }
            case ActivityType.NFT_TRANSFER: {
                return (
                    <NonFungibleTokenTransferDetails
                        activity={
                            (activityFromStore ??
                                activity) as NonFungibleTokenActivity
                        }
                    />
                )
            }
            case ActivityType.CONNECTED_APP_TRANSACTION: {
                return (
                    <ConnectedAppDetails
                        activity={
                            (activityFromStore ??
                                activity) as ConnectedAppTxActivity
                        }
                    />
                )
            }
            default:
                return <></>
        }
    }, [activity, activityFromStore, token])

    const onAddContactPress = useCallback(
        (address: string) => {
            setSelectedContactAddress(address)

            openAddContactSheet()
        },
        [openAddContactSheet],
    )

    const onAddCustomToken = useCallback(
        (tokenAddress: string) => {
            setCustomTokenAddress(tokenAddress)

            openAddCustomTokenSheet()
        },
        [openAddCustomTokenSheet],
    )

    const handleSaveContact = useCallback(
        (_alias: string, _address: string) => {
            if (selectedContactAddress) {
                dispatch(addContact(_alias, _address))
                closeAddContactSheet()
            }
        },
        [closeAddContactSheet, dispatch, selectedContactAddress],
    )

    return (
        <BaseSafeArea grow={1} testID="Activity_Details_Screen">
            <BackButtonHeader hasBottomSpacer={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: calculateBottomInsets }}
                style={baseStyles.scrollView}>
                <BaseView mx={24}>
                    <BaseText typographyFont="title">
                        {getActivityTitle(activity, LL, isSwap)}
                    </BaseText>

                    <BaseSpacer height={16} />

                    <BaseText typographyFont="subSubTitleLight">
                        {dateTimeActivity}
                    </BaseText>

                    <BaseSpacer height={16} />

                    {isPendingOrFailedActivity && (
                        <>
                            <TransactionStatusBox
                                status={
                                    activityFromStore?.status ??
                                    activity.status ??
                                    ActivityStatus.SUCCESS
                                }
                            />
                            <BaseSpacer height={16} />
                        </>
                    )}

                    {/* Transfer card shows the Address/Addresses involved in the given activity */}
                    {isSwap && swapResult ? (
                        <SwapCard
                            paidTokenAddress={swapResult.paidTokenAddress}
                            paidTokenAmount={swapResult.paidAmount}
                            receivedTokenAddress={
                                swapResult.receivedTokenAddress
                            }
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
                                collectionAddress={
                                    (activity as NonFungibleTokenActivity)
                                        .contractAddress
                                }
                                tokenId={
                                    (activity as NonFungibleTokenActivity)
                                        .tokenId
                                }
                            />

                            <BaseSpacer height={20} />
                        </>
                    )}

                    <BaseText typographyFont="subTitleBold">
                        {LL.DETAILS()}
                    </BaseText>

                    <BaseSpacer height={2} />

                    {/* Render Activity Details based on the 'activity.type' */}
                    {renderActivityDetails}
                </BaseView>
            </ScrollView>

            {activity.isTransaction && (
                <FadeoutButton
                    title={LL.VIEW_ON_EXPLORER().toUpperCase()}
                    action={() => {}}
                />
            )}

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
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    scrollView: {
        width: "100%",
    },
})
