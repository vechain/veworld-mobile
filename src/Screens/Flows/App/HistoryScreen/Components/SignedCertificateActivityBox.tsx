import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { DateUtils } from "~Utils"
import { COLORS } from "~Common/Theme"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { Activity, SignCertActivity } from "~Model"
import { useI18nContext } from "~i18n"
import { getCalendars } from "expo-localization"

type Props = {
    activity: SignCertActivity
    onPress: (activity: Activity) => void
}

export const SignedCertificateActivityBox: React.FC<Props> = memo(
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
                action={() => onPress(activity)}
                style={styles.container}>
                <BaseView
                    w={100}
                    flexDirection="row"
                    style={styles.innerContainer}
                    justifyContent="space-between">
                    <BaseView flexDirection="row">
                        <DropShadow style={[theme.shadows.card]}>
                            <BaseView
                                flexDirection="column"
                                alignItems="center">
                                <BaseIcon
                                    name="text-box-check-outline"
                                    size={20}
                                    color={COLORS.DARK_PURPLE}
                                    testID="magnify"
                                    bg={COLORS.WHITE}
                                    iconPadding={4}
                                />
                            </BaseView>
                        </DropShadow>
                        <BaseView flexDirection="column" alignItems="center">
                            <BaseView pl={12}>
                                <BaseText typographyFont="buttonPrimary" pb={5}>
                                    {LL.SIGN_CERTIFICATE()}
                                </BaseText>
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
