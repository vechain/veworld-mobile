import React from "react"
import { BaseText, BaseSafeArea, BackButtonHeader } from "~Components"

// TODO: UI
export const HistoryScreen = () => {
    return (
        <BaseSafeArea>
            <BackButtonHeader />
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <BaseText>History</BaseText>
        </BaseSafeArea>
    )
}
