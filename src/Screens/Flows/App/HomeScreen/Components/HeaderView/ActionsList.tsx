import React, { memo } from "react"
import { BaseText, BaseView } from "~Components"

export const ActionsList = memo(() => {
    return (
        <BaseView
            orientation="row"
            justify="space-evenly"
            align="center"
            px={20}
            py={30}>
            <BaseText>Buy</BaseText>
            <BaseText>Send</BaseText>
            <BaseText>Swap</BaseText>
            <BaseText>History</BaseText>
        </BaseView>
    )
})
