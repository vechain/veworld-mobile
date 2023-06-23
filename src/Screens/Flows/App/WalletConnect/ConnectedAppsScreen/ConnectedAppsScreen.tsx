import React, { useMemo } from "react"
import {
    BaseText,
    BackButtonHeader,
    BaseSafeArea,
    BaseView,
    BaseSpacer,
} from "~Components"
import { useAppSelector, selectSessions, selectAccounts } from "~Storage/Redux"
import { SessionTypes } from "@walletconnect/types"
import { isEmpty } from "lodash"
import {
    EmptyListView,
    ConnectedAppBox,
    ConnectedAppsHeader,
} from "./Components"
import { ScrollView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { AccountWithDevice } from "~Model"

export const ConnectedAppsScreen = () => {
    const activeSessions: Record<string, SessionTypes.Struct[]> =
        useAppSelector(selectSessions)
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()

    const totalSessions = useMemo(() => {
        return Object.values(activeSessions).reduce(
            (acc, curr) => acc + curr.length,
            0,
        )
    }, [activeSessions])

    const renderAppsOfAccount = (account: AccountWithDevice, index: number) => {
        return (
            <BaseView key={account.address}>
                {index > 0 && <BaseSpacer height={16} />}
                <BaseText typographyFont="subSubTitle">
                    {account.alias}
                </BaseText>
                {activeSessions[account.address].map(session => {
                    return (
                        <ConnectedAppBox
                            session={session}
                            key={session.topic}
                            account={account}
                        />
                    )
                })}
            </BaseView>
        )
    }

    return (
        <BaseSafeArea>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[baseStyles.scrollViewContainer]}
                style={baseStyles.scrollView}>
                <BackButtonHeader />
                <BaseView mx={20}>
                    <ConnectedAppsHeader showAddButton={totalSessions > 0} />

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APPS_SCREEN_SUBTITLE()}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.CONNECTED_APPS_SCREEN_DESCRIPTION()}
                    </BaseText>

                    <BaseSpacer height={22} />

                    {totalSessions === 0 && (
                        <>
                            <BaseSpacer height={60} />
                            <EmptyListView />
                        </>
                    )}

                    {accounts.map((account, index) => {
                        if (
                            account.address in activeSessions &&
                            !isEmpty(activeSessions[account.address])
                        ) {
                            return renderAppsOfAccount(account, index)
                        }
                    })}
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
