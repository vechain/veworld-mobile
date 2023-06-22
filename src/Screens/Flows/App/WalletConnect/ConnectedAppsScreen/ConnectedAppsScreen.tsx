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
import { ConnectAppButton, ConnectedApp } from "./Components"
import { ScrollView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"

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
                    <BaseText typographyFont="title">
                        {LL.CONNECTED_APPS_SCREEN_TITLE()}
                    </BaseText>

                    <BaseSpacer height={40} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APPS_SCREEN_DESCRIPTION()}
                    </BaseText>
                    <BaseSpacer height={14} />
                    <ConnectAppButton />

                    <BaseSpacer height={40} />

                    {totalSessions === 0 && (
                        <>
                            <BaseText typographyFont="subTitleLight" mt={50}>
                                {LL.CONNECTED_APPS_SCREEN_NO_CONNECTED_APP()}
                            </BaseText>
                        </>
                    )}

                    {accounts.map((account, index) => {
                        if (
                            account.address in activeSessions &&
                            !isEmpty(activeSessions[account.address])
                        ) {
                            return (
                                <BaseView key={account.address}>
                                    {index > 0 && <BaseSpacer height={16} />}
                                    <BaseText typographyFont="subSubTitle">
                                        {account.alias}
                                    </BaseText>
                                    {activeSessions[account.address].map(
                                        session => {
                                            return (
                                                <ConnectedApp
                                                    session={session}
                                                    key={session.topic}
                                                    account={account}
                                                />
                                            )
                                        },
                                    )}
                                </BaseView>
                            )
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
