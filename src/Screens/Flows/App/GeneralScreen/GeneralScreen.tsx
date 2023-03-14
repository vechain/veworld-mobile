import React from "react"
import { BaseSafeArea, BaseView } from "~Components"
import { ChangeTheme } from "./Components/ChangeTheme"

export const GeneralScreen = () => {
    return (
        <BaseSafeArea grow={1}>
            <BaseView mx={20}>
                <ChangeTheme />
            </BaseView>
        </BaseSafeArea>
    )
}
