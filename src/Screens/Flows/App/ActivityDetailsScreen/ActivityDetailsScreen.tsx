import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    SwapCard,
    FadeoutButton,
    TransferCard,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { ScrollView, StyleSheet } from "react-native"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { DateUtils, TransactionUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { getActivityTitle } from "./util"
import { getCalendars } from "expo-localization"
import {
    ActivityStatus,
    ActivityType,
    ConnectedAppTxActivity,
    ContactType,
    FungibleTokenActivity,
    SignCertActivity,
} from "~Model"
import {
    FungibleTokenTransferDetails,
    SignCertificateDetails,
    DappTransactionDetails,
    ActivityStatusBox,
} from "./Components"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
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

    const nav = useNavigation()

    const theme = useTheme()

    const { LL, locale } = useI18nContext()

    const tabBarHeight = useBottomTabBarHeight()

    const dispatch = useAppDispatch()

    const [selectedContactAddress, setSelectedContactAddress] =
        useState<string>()

    const [customTokenAddress, setCustomTokenAddress] = useState<string>()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const activityFromStore = useAppSelector(selectActivity(activity.id))

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
            activity.type !== ActivityType.CONNECTED_APP_TRANSACTION
        )
            return undefined

        return TransactionUtils.decodeSwapTransferAmounts(
            decodedClauses,
            activity as ConnectedAppTxActivity,
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
            case ActivityType.CONNECTED_APP_TRANSACTION: {
                return (
                    <DappTransactionDetails
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
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[
                    baseStyles.scrollViewContainer,
                    { paddingBottom: tabBarHeight },
                ]}
                style={baseStyles.scrollView}>
                <BaseView pb={6}>
                    <BaseIcon
                        style={baseStyles.backIcon}
                        size={36}
                        name="chevron-left"
                        color={theme.colors.text}
                        action={goBack}
                    />
                </BaseView>
                <BaseView mx={20}>
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
                            <ActivityStatusBox
                                status={
                                    activityFromStore?.status || activity.status
                                }
                            />
                            <BaseSpacer height={16} />
                        </>
                    )}

                    {/* Transfer card shows the Address/Addresses involved in the given activity */}
                    {activity.isTransaction &&
                        (isSwap && swapResult ? (
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
                            <TransferCard
                                fromAddress={activity.from}
                                toAddresses={[...new Set(activity.to)]}
                                onAddContactPress={onAddContactPress}
                            />
                        ))}

                    <BaseSpacer height={20} />

                    <BaseText typographyFont="subTitleBold">
                        {LL.DETAILS()}
                    </BaseText>

                    <BaseSpacer height={2} />

                    {/* Render Activity Details based on the 'activity.type' */}
                    {renderActivityDetails}

                    <BaseSpacer height={32} />
                </BaseView>
            </ScrollView>

            <FadeoutButton
                title={LL.VIEW_ON_EXPLORER().toUpperCase()}
                action={() => {}}
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
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
