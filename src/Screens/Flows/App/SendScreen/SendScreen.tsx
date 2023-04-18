import React from "react"
import { BaseText, BaseSafeArea, BackButtonHeader } from "~Components"

// TODO: UI
export const SendScreen = () => {
    return (
        <BaseSafeArea>
            <BackButtonHeader />
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <BaseText>Send</BaseText>
        </BaseSafeArea>
    )
}
