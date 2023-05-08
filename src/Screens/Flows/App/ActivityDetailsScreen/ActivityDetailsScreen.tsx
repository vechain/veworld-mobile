import React, { useCallback, useMemo } from "react"
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
import { DateUtils, useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { getActivityTitle } from "./util"
import { getCalendars } from "expo-localization"
import { ActivityType, FungibleTokenActivity } from "~Model"
import { FungibleTokenTransferDetails } from "./Components"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

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

    const goBack = useCallback(() => nav.goBack(), [nav])

    const dateTimeActivity = useMemo(() => {
        return DateUtils.formatDateTime(
            activity.timestamp ?? 0,
            locale,
            getCalendars()[0].timeZone ?? DateUtils.DEFAULT_TIMEZONE,
        )
    }, [activity.timestamp, locale])

    const isFungibleTokenActivity = useMemo(() => {
        return (
            activity.type === ActivityType.FUNGIBLE_TOKEN ||
            activity.type === ActivityType.VET_TRANSFER
        )
    }, [activity.type])

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
            //TODO Other activity type details
        }
    }, [activity, token])

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

                    {activity.to && isFungibleTokenActivity && (
                        <TransferCard
                            fromAddress={activity.from}
                            toAddress={activity.to[0]}
                        />
                    )}

                    <BaseSpacer height={20} />

                    {/* TODO action click opens in-app browser or system browser. TBD with others */}
                    <BaseButton
                        action={() => {}}
                        w={100}
                        title={LL.VIEW_ON_EXPLORER().toUpperCase()}
                        haptics="medium"
                        typographyFont="buttonPrimary"
                    />

                    <BaseSpacer height={20} />

                    <BaseText typographyFont="subTitleBold">
                        {LL.DETAILS()}
                    </BaseText>

                    <BaseSpacer height={2} />

                    {/* Render Activity Details */}
                    {renderActivityDetails}
                </BaseView>
            </ScrollView>
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
