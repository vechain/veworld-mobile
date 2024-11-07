import React from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { AlertStatus, generateAlertStyles } from "./utils/AlertStyles"

export const AlertInline = ({ message, status }: { message: string; status: AlertStatus }) => {
    const styles = generateAlertStyles(status, "inline")

    return (
        <BaseView style={styles.container}>
            <BaseView w={100}>
                <BaseView flexDirection="row">
                    <BaseIcon name={styles.icon.name} size={16} color={styles.icon.color} />
                    <BaseSpacer width={12} />
                    <BaseText typographyFont="captionRegular" color={styles.colors.title}>
                        {message}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}
