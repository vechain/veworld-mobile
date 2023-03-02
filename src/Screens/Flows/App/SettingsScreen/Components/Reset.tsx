import React, { useCallback } from "react"
import { useTheme } from "~Common"
import { BaseButton } from "~Components"
import { Config, useRealm } from "~Storage"

export const Reset: React.FC = () => {
    const { store } = useRealm()
    const theme = useTheme()

    const onReset = useCallback(() => {
        store.write(() => {
            const config = store.objectForPrimaryKey<Config>(
                Config.getName(),
                Config.getPrimaryKey(),
            )
            if (config) config.isResettingApp = true
        })
    }, [store])

    return (
        <BaseButton
            action={onReset}
            w={100}
            px={20}
            bgColor={theme.colors.danger}
            title={"Reset app"}
        />
    )
}
