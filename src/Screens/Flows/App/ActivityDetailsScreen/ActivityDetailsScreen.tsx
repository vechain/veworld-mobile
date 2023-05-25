import React, { useCallback, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    TransferCard,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { ScrollView, StyleSheet } from "react-native"
import { SCREEN_WIDTH, useBottomSheetModal, useTheme, valueToHP } from "~Common"
import { DateUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { getActivityTitle } from "./util"
import { getCalendars } from "expo-localization"
import {
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
} from "./Components"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { ContactManagementBottomSheet } from "../ContactsScreen"
import { addContact } from "~Storage/Redux/Actions/Contacts"
import { useAppDispatch } from "~Storage/Redux"
import LinearGradient from "react-native-linear-gradient"

type Props = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.ACTIVITY_DETAILS
>

export const ActivityDetailsScreen = ({ route }: Props) => {
    const { activity, token } = route.params

    const nav = useNavigation()

    const theme = useTheme()

    const { LL, locale } = useI18nContext()

    const tabBarHeight = useBottomTabBarHeight()

    const dispatch = useAppDispatch()

    const [selectedContactAddress, setSelectedContactAddress] =
        useState<string>()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const {
        ref: addContactSheet,
        onOpen: openAddContactSheet,
        onClose: closeAddContactSheet,
    } = useBottomSheetModal()

    const dateTimeActivity = useMemo(() => {
        return DateUtils.formatDateTime(
            activity.timestamp ?? 0,
            locale,
            getCalendars()[0].timeZone ?? DateUtils.DEFAULT_TIMEZONE,
        )
    }, [activity.timestamp, locale])

    const renderActivityDetails = useMemo(() => {
        switch (activity.type) {
            case ActivityType.FUNGIBLE_TOKEN:
            case ActivityType.VET_TRANSFER: {
                return (
                    <FungibleTokenTransferDetails
                        activity={activity as FungibleTokenActivity}
                        token={token}
                    />
                )
            }
            case ActivityType.SIGN_CERT: {
                return (
                    <SignCertificateDetails
                        activity={activity as SignCertActivity}
                    />
                )
            }
            case ActivityType.CONNECTED_APP_TRANSACTION: {
                return (
                    <DappTransactionDetails
                        activity={activity as ConnectedAppTxActivity}
                    />
                )
            }
            default:
                return <></>
        }
    }, [activity, token])

    const onAddContactPress = useCallback(
        (address: string) => {
            setSelectedContactAddress(address)

            openAddContactSheet()
        },
        [openAddContactSheet],
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
        <BaseSafeArea grow={1}>
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
                        {getActivityTitle(activity, LL)}
                    </BaseText>

                    <BaseSpacer height={16} />

                    <BaseText typographyFont="subSubTitleLight">
                        {dateTimeActivity}
                    </BaseText>

                    <BaseSpacer height={16} />

                    {/* Transfer card shows the Address/Addresses involved in the given activity */}
                    <TransferCard
                        fromAddress={activity.from}
                        toAddresses={[...new Set(activity.to)]}
                        onAddContactPress={onAddContactPress}
                    />

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

            {/* Linear gradient fades the elements below the child button */}
            <LinearGradient
                style={[
                    baseStyles.explorerButton,
                    {
                        bottom: tabBarHeight,
                    },
                ]}
                colors={[
                    theme.colors.backgroundTransparent,
                    theme.colors.background,
                ]}>
                <BaseView
                    mx={20}
                    style={{ width: SCREEN_WIDTH - 40 }}
                    py={valueToHP[16]}>
                    {/* TODO action click opens in-app browser or system browser. TBD with others */}
                    <BaseButton
                        action={() => {}}
                        w={100}
                        title={LL.VIEW_ON_EXPLORER().toUpperCase()}
                        haptics="medium"
                        typographyFont="buttonPrimary"
                    />
                </BaseView>
            </LinearGradient>

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
    explorerButton: {
        position: "absolute",
        width: "100%",
    },
})
