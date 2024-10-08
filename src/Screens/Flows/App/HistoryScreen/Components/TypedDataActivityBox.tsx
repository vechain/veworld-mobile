import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import { BaseTouchable, BaseView, BaseIcon, BaseText } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, ActivityStatus, TypedDataActivity } from "~Model"
import { DateUtils } from "~Utils"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"

type Props = {
    activity: TypedDataActivity
    onPress: (activity: Activity) => void
}

export const TypedDataActivityBox: React.FC<Props> = ({ activity, onPress }) => {
    const theme = useTheme()

    const { LL, locale } = useI18nContext()

    const dateTimeActivity = useMemo(() => {
        return activity.timestamp
            ? DateUtils.formatDateTime(activity.timestamp, locale, getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE)
            : LL.DATE_NOT_AVAILABLE()
    }, [LL, activity.timestamp, locale])

    return (
        <BaseTouchable haptics="Light" action={() => onPress(activity)} style={baseStyles.container}>
            <BaseView w={100} flexDirection="row" style={baseStyles.innerContainer} justifyContent="space-between">
                <BaseView flexDirection="row">
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseIcon
                            name="text-box-check-outline"
                            size={20}
                            color={COLORS.DARK_PURPLE}
                            testID="magnify"
                            bg={COLORS.WHITE}
                            iconPadding={4}
                        />
                    </BaseView>
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseView pl={12}>
                            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start">
                                <BaseText typographyFont="buttonPrimary" pb={5}>
                                    {LL.CONNECTED_APP_SIGN_TYPED_DATA()}
                                </BaseText>
                                {activity.status && activity.status !== ActivityStatus.SUCCESS && (
                                    <ActivityStatusIndicator activityStatus={activity.status} />
                                )}
                            </BaseView>
                            <BaseText typographyFont="smallCaptionRegular">{dateTimeActivity}</BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <BaseView flexDirection="column" alignItems="center" pl={5}>
                    <BaseIcon size={24} name="chevron-right" color={theme.colors.text} />
                </BaseView>
            </BaseView>
        </BaseTouchable>
    )
}

const baseStyles = StyleSheet.create({
    innerContainer: {
        height: 68,
    },
    container: {
        width: "100%",
    },
})
