import React, { memo, useMemo } from "react"
import { BaseIcon, BaseSpacer, BaseView, FastActionsBar } from "~Components"
import { Header } from "./Header"

import { useTheme } from "~Common"
import { useAppSelector } from "~Storage/Redux"
import {
    getBalanceVisible,
    selectCurrency,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import { FastAction } from "~Model"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { AccountCard } from "./AccountCard"

type Props = {
    openAccountManagementSheet: () => void
    openSelectAccountBottomSheet: () => void
}

export const HeaderView = memo(
    ({ openAccountManagementSheet, openSelectAccountBottomSheet }: Props) => {
        const selectedAccount = useAppSelector(selectSelectedAccount)
        const balanceVisible = useAppSelector(getBalanceVisible)

        const { LL } = useI18nContext()
        const nav = useNavigation()
        const theme = useTheme()
        const selectedCurrency = useAppSelector(selectCurrency)

        const Actions: FastAction[] = useMemo(
            () => [
                {
                    name: LL.BTN_SEND(),
                    action: () =>
                        nav.navigate(Routes.SELECT_TOKEN_SEND, {
                            initialRoute: Routes.HOME,
                        }),
                    icon: (
                        <BaseIcon
                            color={theme.colors.text}
                            name="send-outline"
                        />
                    ),
                    testID: "sendButton",
                },
                {
                    name: LL.BTN_WALLET_CONNECT(),
                    action: () => nav.navigate(Routes.WALLET_CONNECT),
                    icon: (
                        <BaseIcon
                            color={theme.colors.text}
                            name="flip-horizontal"
                        />
                    ),
                    testID: "walletConnectButton",
                },
                {
                    name: LL.BTN_HISTORY(),
                    action: () => nav.navigate(Routes.HISTORY),
                    icon: <BaseIcon color={theme.colors.text} name="history" />,
                    testID: "historyButton",
                },
            ],
            [LL, nav, theme.colors.text],
        )

        return (
            <>
                <BaseView alignItems="center">
                    <Header />
                    <BaseSpacer height={20} />
                    <AccountCard
                        balanceVisible={balanceVisible}
                        openAccountManagement={openAccountManagementSheet}
                        openSelectAccountBottomSheet={
                            openSelectAccountBottomSheet
                        }
                        account={selectedAccount}
                        selectedCurrency={selectedCurrency}
                    />
                </BaseView>

                <BaseSpacer height={24} />
                <FastActionsBar actions={Actions} />
            </>
        )
    },
)
