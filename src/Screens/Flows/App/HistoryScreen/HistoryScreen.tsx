import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { FormattingUtils, useTheme } from "~Common"
import {
    BaseText,
    BaseSafeArea,
    BaseView,
    ChangeAccountButtonPill,
    BaseIcon,
    BaseSpacer,
} from "~Components"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { ACTIVITIES_MOCK } from "./mock"
import { FlashList } from "@shopify/flash-list"
import { FungibleTokenActivityBox } from "./Components"
import {
    Activity,
    ActivityType,
    ConnectedAppTxActivity,
    FungibleToken,
    FungibleTokenActivity,
    SignCertActivity,
} from "~Model"
import PlatformUtils from "~Common/Utils/PlatformUtils" // this is imported like so to avoid circular dependency
import { Routes } from "~Navigation"
import { DappTransactionActivityBox } from "./Components/DappTransactionActivityBox"
import { SignedCertificateActivityBox } from "./Components/SignedCertificateActivityBox"

export const HistoryScreen = () => {
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const nav = useNavigation()

    const theme = useTheme()

    // TODO
    const onChangeAccountPress = () => {}

    const goBack = useCallback(() => nav.goBack(), [nav])

    const onActivityPress = useCallback(
        (activity: Activity, token?: FungibleToken) => {
            nav.navigate(Routes.ACTIVITY_DETAILS, { activity, token })
        },
        [nav],
    )

    const renderActivity = useCallback(
        (activity: Activity, index: number) => {
            const id = `activity-${index}`

            switch (activity.type) {
                case ActivityType.FUNGIBLE_TOKEN:
                case ActivityType.VET_TRANSFER:
                    return (
                        <FungibleTokenActivityBox
                            key={id}
                            activity={activity as FungibleTokenActivity}
                            onPress={onActivityPress}
                        />
                    )
                case ActivityType.CONNECTED_APP_TRANSACTION:
                    return (
                        <DappTransactionActivityBox
                            key={id}
                            activity={activity as ConnectedAppTxActivity}
                            onPress={onActivityPress}
                        />
                    )
                case ActivityType.SIGN_CERT:
                    return (
                        <SignedCertificateActivityBox
                            activity={activity as SignCertActivity}
                            onPress={onActivityPress}
                        />
                    )
            }
        },
        [onActivityPress],
    )

    const renderActivitiesList = useMemo(() => {
        return (
            <>
                <BaseSpacer height={30} />
                <BaseView flexDirection="row" style={baseStyles.list}>
                    <FlashList
                        data={ACTIVITIES_MOCK} //TODO replace with real data
                        keyExtractor={activity => activity.id}
                        renderItem={({ item: activity, index }) => {
                            return (
                                <BaseView mx={20}>
                                    {renderActivity(activity, index)}
                                </BaseView>
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        estimatedItemSize={80}
                        estimatedListSize={{
                            height: 500,
                            width: 400,
                        }}
                    />
                </BaseView>
            </>
        )
    }, [renderActivity])

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />

            <BaseSpacer height={12} />
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="title">{LL.BTN_HISTORY()}</BaseText>

                <ChangeAccountButtonPill
                    title={selectedAccount?.alias ?? LL.WALLET_LABEL_ACCOUNT()}
                    text={FormattingUtils.humanAddress(
                        selectedAccount?.address ?? "",
                        5,
                        4,
                    )}
                    action={onChangeAccountPress}
                />
            </BaseView>
            {/* Activities List */}
            {!!ACTIVITIES_MOCK.length && renderActivitiesList}
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    list: {
        height: PlatformUtils.isIOS() ? "75%" : "76%",
    },
})
