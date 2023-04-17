import React from "react"
import { BackButtonHeader, BaseSafeArea, BaseText } from "~Components"

// TODO: UI
export const SwapScreen = () => {
    return (
        <BaseSafeArea>
            <BackButtonHeader />
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <BaseText>Swap</BaseText>
        </BaseSafeArea>
    )
}
