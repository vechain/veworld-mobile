import React from "react"
import { BaseText, BaseView } from "~Components"

export const SecurityDowngradeScreen = () => {
    return (
        <BaseView
            style={{
                flex: 1,
                backgroundColor: "red",
                // position: "absolute",
            }}>
            <BaseText>DOWNGRADE DETECTED!!!!</BaseText>
        </BaseView>
    )
}
