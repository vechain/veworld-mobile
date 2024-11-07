import React from "react"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { AlertStatus, generateAlertStyles } from "./utils/AlertStyles"

export const AlertCard = ({ title, message, status }: { title: string; message: string; status: AlertStatus }) => {
    const styles = generateAlertStyles(status, "card")

    return (
        <BaseCard containerStyle={styles.container}>
            <BaseView w={100}>
                <BaseView flexDirection="row">
                    <BaseIcon name={styles.icon.name} size={16} color={styles.icon.color} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="bodyMedium" color={styles.colors.title}>
                        {title}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={4} />
                <BaseText typographyFont="captionRegular" color={styles.colors.description} pl={24}>
                    {message}
                </BaseText>
            </BaseView>
        </BaseCard>
    )
}
