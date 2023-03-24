import React, { useCallback } from "react"
import { BaseTouchable } from "~Components"
import { useAppDispatch } from "~Storage/Redux"
import { setIsResettingApp } from "~Storage/Redux/Actions"
import { useI18nContext } from "~i18n"

export const Reset: React.FC = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const onReset = useCallback(
        () => dispatch(setIsResettingApp(true)),
        [dispatch],
    )

    return (
        <BaseTouchable action={onReset} title={LL.BTN_RESET_APP()} underlined />
    )
}
