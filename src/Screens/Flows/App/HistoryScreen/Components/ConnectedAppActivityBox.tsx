import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme, useThemedStyles } from "~Hooks"
import { DateUtils } from "~Utils"
import { COLORS, ColorThemeType } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { Activity, ActivityStatus, ConnectedAppActivity } from "~Model"
import { useI18nContext } from "~i18n"
import { getCalendars } from "expo-localization"
import { ActivityStatusIndicator } from "."

type Props = {
    activity: ConnectedAppActivity
    onPress: (activity: Activity) => void
}

export const ConnectedAppActivityBox: React.FC<Props> = memo(
    ({ activity, onPress }) => {
        const theme = useTheme()

        const { styles } = useThemedStyles(baseStyles)

        const { LL, locale } = useI18nContext()

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
                style={styles.container}>
                <BaseView
                    w={100}
                    flexDirection="row"
                    style={styles.innerContainer}
                    justifyContent="space-between">
                    <BaseView flexDirection="row">
                        <BaseView flexDirection="column" alignItems="center">
                            <BaseIcon
                                name="laptop"
                                size={20}
                                color={COLORS.DARK_PURPLE}
                                testID="magnify"
                                bg={COLORS.WHITE}
                                iconPadding={4}
                            />
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
                                        {LL.CONNECTED_APP_TITLE()}
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        innerContainer: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
            height: 65,
        },
        container: {
            width: "100%",
        },
    })
