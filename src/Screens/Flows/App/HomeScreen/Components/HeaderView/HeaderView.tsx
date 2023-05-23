import React, { memo, useCallback, useMemo } from "react"
import { BaseIcon, BaseSpacer, BaseView, FastActionsBar } from "~Components"
import { Header } from "./Header"
import { AccountsCarousel } from "./AccountsCarousel"

import { useTheme } from "~Common"
import { AddressUtils } from "~Utils"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    getBalanceVisible,
    selectSelectedAccount,
    selectVisibleAccounts,
} from "~Storage/Redux/Selectors"
import { selectAccount } from "~Storage/Redux/Actions"
import { FastAction, WalletAccount } from "~Model"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

type Props = {
    openAccountManagementSheet: () => void
}

export const HeaderView = memo(({ openAccountManagementSheet }: Props) => {
    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const balanceVisible = useAppSelector(getBalanceVisible)

    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const theme = useTheme()

    const selectedAccountIndex = useMemo(
        () =>
            accounts.findIndex(account =>
                AddressUtils.compareAddresses(
                    selectedAccount?.address,
                    account.address,
                ),
            ),
        [selectedAccount, accounts],
    )

    const onAccountChange = useCallback(
        (account: WalletAccount) => {
            dispatch(selectAccount({ address: account.address }))
        },
        [dispatch],
    )

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_BUY(),
                action: () => nav.navigate(Routes.BUY),
                icon: (
                    <BaseIcon color={theme.colors.text} name="cart-outline" />
                ),
                testID: "buyButton",
            },
            {
                name: LL.BTN_SEND(),
                action: () =>
                    nav.navigate(Routes.SELECT_TOKEN_SEND, {
                        initialRoute: Routes.HOME,
                    }),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
            {
                name: LL.BTN_SWAP(),
                action: () => nav.navigate(Routes.SWAP),
                icon: (
                    <BaseIcon
                        color={theme.colors.text}
                        name="swap-horizontal"
                    />
                ),
                testID: "swapButton",
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
                <AccountsCarousel
                    balanceVisible={balanceVisible}
                    openAccountManagementSheet={openAccountManagementSheet}
                    accounts={accounts}
                    onAccountChange={onAccountChange}
                    selectedAccountIndex={selectedAccountIndex}
                />
            </BaseView>

            <BaseSpacer height={24} />
            <FastActionsBar actions={Actions} />
        </>
    )
})
