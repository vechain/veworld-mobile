import React, { memo } from "react"
import { BaseText, BaseView } from "~Components"

export const ActionsList = memo(() => {
    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-evenly"
            alignItems="center"
            px={20}
            py={30}>
            <BaseText>Buy</BaseText>
            <BaseText>Send</BaseText>
            <BaseText>Swap</BaseText>
            <BaseText>History</BaseText>
        </BaseView>
    )
})
