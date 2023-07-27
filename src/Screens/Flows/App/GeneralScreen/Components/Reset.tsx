import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { BaseTouchable } from "~Components"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"

export const Reset: React.FC = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const onReset = useCallback(() => nav.navigate(Routes.RESET_APP), [nav])

    return (
        <BaseTouchable
            action={onReset}
            title={LL.BTN_RESET_APP()}
            underlined
            haptics="Light"
        />
    )
}
