import React from "react"
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
import { ConnectedApp } from "./components"

export const ConnectedAppsScreen = () => {
    const activeSessions: Record<string, SessionTypes.Struct[]> =
        useAppSelector(selectSessions)
    const accounts = useAppSelector(selectAccounts)

    return (
        <BaseSafeArea>
            <BackButtonHeader />
            <BaseView mx={20}>
                <BaseText typographyFont="title">{"Connected Apps"}</BaseText>

                {accounts.map(account => {
                    if (
                        account.address in activeSessions &&
                        !isEmpty(activeSessions[account.address])
                    ) {
                        return (
                            <BaseSafeArea key={account.address}>
                                <BaseText typographyFont="subSubTitleLight">
                                    {account.alias}
                                </BaseText>
                                <BaseSpacer height={16} />
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
                            </BaseSafeArea>
                        )
                    }
                })}
            </BaseView>
        </BaseSafeArea>
    )
}
