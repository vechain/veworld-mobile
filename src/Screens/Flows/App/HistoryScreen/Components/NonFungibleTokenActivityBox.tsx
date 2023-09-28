import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { DateUtils } from "~Utils"
import { COLORS, DIRECTIONS } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { Activity, ActivityStatus, NonFungibleTokenActivity } from "~Model"
import { useI18nContext } from "~i18n"
import { getCalendars } from "expo-localization"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"
import { HistoryReceiveNFTIconSVG, HistorySendNFTIconSVG } from "~Assets"

type Props = {
    activity: NonFungibleTokenActivity
    onPress: (activity: Activity) => void
}

export const NonFungibleTokenActivityBox: React.FC<Props> = memo(
    ({ activity, onPress }) => {
        const theme = useTheme()

        const { LL, locale } = useI18nContext()

        const transferDirectionText =
            activity.direction === DIRECTIONS.UP
                ? LL.NFT_SEND()
                : LL.NFT_RECEIVE()

        const directionIcon = useMemo(() => {
            return activity.direction === DIRECTIONS.UP ? (
                <HistorySendNFTIconSVG />
            ) : (
                <HistoryReceiveNFTIconSVG />
            )
        }, [activity.direction])

        const dateTimeActivity = useMemo(() => {
            return activity.timestamp
                ? DateUtils.formatDateTime(
                      activity.timestamp,
                      locale,
                      getCalendars()[0].timeZone ?? DateUtils.DEFAULT_TIMEZONE,
                  )
                : LL.DATE_NOT_AVAILABLE()
        }, [LL, activity.timestamp, locale])

        return (
            <BaseTouchable
                haptics="Light"
                action={() => onPress(activity)}
                style={baseStyles.container}>
                <BaseView
                    w={100}
                    flexDirection="row"
                    style={baseStyles.innerContainer}
                    justifyContent="space-between">
                    <BaseView flexDirection="row">
                        <BaseView
                            justifyContent="center"
                            alignItems="center"
                            style={baseStyles.icon}>
                            {directionIcon}
                        </BaseView>
                        <BaseView flexDirection="column" alignItems="center">
                            <BaseView pl={12}>
                                <BaseView
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start">
                                    <BaseText
                                        typographyFont="buttonPrimary"
                                        pb={5}>
                                        {transferDirectionText}
                                    </BaseText>
                                    {activity.status &&
                                        activity.status !==
                                            ActivityStatus.SUCCESS && (
                                            <ActivityStatusIndicator
                                                activityStatus={activity.status}
                                            />
                                        )}
                                </BaseView>
                                <BaseText typographyFont="smallCaptionRegular">
                                    {dateTimeActivity}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseView flexDirection="column" alignItems="center" pl={5}>
                        <BaseIcon
                            size={24}
                            name="chevron-right"
                            color={theme.colors.text}
                        />
                    </BaseView>
                </BaseView>
            </BaseTouchable>
        )
    },
)

const baseStyles = StyleSheet.create({
    innerContainer: {
        height: 68,
    },
    container: {
        width: "100%",
    },
    icon: {
        backgroundColor: COLORS.WHITE,
        width: 38,
        height: 38,
        borderRadius: 19,
    },
})
