import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { BaseTouchable, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const ActionsList = memo(() => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const buy = useCallback(() => {
        nav.navigate(Routes.BUY)
    }, [nav])
    const send = useCallback(() => {
        nav.navigate(Routes.SEND)
    }, [nav])
    const swap = useCallback(() => {
        nav.navigate(Routes.SWAP)
    }, [nav])
    const history = useCallback(() => {
        nav.navigate(Routes.HISTORY)
    }, [nav])

    return (
        <BaseView
            orientation="row"
            justify="space-evenly"
            align="center"
            px={20}
            py={30}>
            <BaseTouchable action={buy} title={LL.BTN_BUY()} />
            <BaseTouchable action={send} title={LL.BTN_SEND()} />
            <BaseTouchable action={swap} title={LL.BTN_SWAP()} />
            <BaseTouchable action={history} title={LL.BTN_HISTORY()} />
        </BaseView>
    )
})
