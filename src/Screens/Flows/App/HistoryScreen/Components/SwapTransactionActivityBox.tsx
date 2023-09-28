import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { useTheme } from "~Hooks"
import { DateUtils } from "~Utils"
import { COLORS } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import {
    Activity,
    ActivityStatus,
    DappTxActivity,
    FungibleToken,
    TransactionOutcomes,
} from "~Model"
import { useI18nContext } from "~i18n"
import { getCalendars } from "expo-localization"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"

type Props = {
    activity: DappTxActivity
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
                action={() =>
                    onPress(activity, undefined, true, decodedClauses)
                }
                style={baseStyles.container}>
                <BaseView
                    w={100}
                    flexDirection="row"
                    style={baseStyles.innerContainer}
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
})
