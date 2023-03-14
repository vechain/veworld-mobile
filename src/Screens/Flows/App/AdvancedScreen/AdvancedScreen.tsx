import React from "react"
import { BaseSafeArea, BaseView } from "~Components"
import { Reset } from "./Components/Reset"

export const AdvancedScreen = () => {
    return (
        <BaseSafeArea grow={1}>
            <BaseView mx={20}>
                <Reset />
            </BaseView>
        </BaseSafeArea>
    )
}
