import React, { useCallback } from "react"
import { BaseTouchable } from "~Components"
import { getConfig, useRealm } from "~Storage"
import { useI18nContext } from "~i18n"

export const Reset: React.FC = () => {
    const { store } = useRealm()
    const { LL } = useI18nContext()

    const onReset = useCallback(() => {
        store.write(() => {
            const config = getConfig(store)
            if (config) config.isResettingApp = true
        })
    }, [store])

    return (
        <BaseTouchable action={onReset} title={LL.BTN_RESET_APP()} underlined />
    )
}
