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

export const ConnectedAppsScreen = () => {
    const activeSessions: Record<string, SessionTypes.Struct[]> =
        useAppSelector(selectSessions)
    const accounts = useAppSelector(selectAccounts)

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
                        {"Connected Apps"}
                    </BaseText>

                    <BaseSpacer height={40} />
                    <BaseText typographyFont="subTitle">
                        {
                            "Connect your wallet with WalletConnect to make transactions."
                        }
                    </BaseText>
                    <BaseSpacer height={14} />
                    <ConnectAppButton />

                    <BaseSpacer height={40} />

                    {totalSessions === 0 && (
                        <>
                            <BaseText typographyFont="subTitleLight" mt={50}>
                                {
                                    "You have no connected apps. Once you have some, they will displayed here."
                                }
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
                                        (session, i) => {
                                            return (
                                                <>
                                                    <BaseSpacer height={16} />
                                                    <ConnectedApp
                                                        session={session}
                                                        key={session.topic + i}
                                                        account={account}
                                                    />
                                                </>
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
        height: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
