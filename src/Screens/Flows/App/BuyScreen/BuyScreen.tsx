import React from "react"
import { BackButtonHeader, BaseSafeArea, BaseText } from "~Components"

export const BuyScreen = () => {
    return (
        <BaseSafeArea>
            <BackButtonHeader />
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <BaseText>Buy</BaseText>
        </BaseSafeArea>
    )
}
