import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { DateUtils } from "~Utils"
import { COLORS } from "~Common/Theme"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import {
    Activity,
    ActivityStatus,
    ConnectedAppTxActivity,
    FungibleToken,
    TransactionOutcomes,
} from "~Model"
import { useI18nContext } from "~i18n"
import { getCalendars } from "expo-localization"
import { ActivityStatusIndicator } from "."

type Props = {
    activity: ConnectedAppTxActivity
    decodedClauses: TransactionOutcomes
    onPress: (
        activity: Activity,
        token?: FungibleToken,
        isSwap?: boolean,
        decodedClauses?: TransactionOutcomes,
    ) => void
}

export const SwapTransactionActivityBox: React.FC<Props> = memo(
    ({ activity, decodedClauses, onPress }) => {
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
                action={() =>
                    onPress(activity, undefined, true, decodedClauses)
                }
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
                                    name="swap-horizontal"
                                    size={20}
                                    color={COLORS.DARK_PURPLE}
                                    testID="swap-horizontal"
                                    bg={COLORS.WHITE}
                                    iconPadding={4}
                                />
                            </BaseView>
                        </DropShadow>
                        <BaseView flexDirection="column" alignItems="center">
                            <BaseView pl={12}>
                                <BaseView
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start">
                                    <BaseText
                                        typographyFont="buttonPrimary"
                                        pb={5}>
                                        {LL.SWAP()}
                                    </BaseText>
                                    {activity.status !==
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
