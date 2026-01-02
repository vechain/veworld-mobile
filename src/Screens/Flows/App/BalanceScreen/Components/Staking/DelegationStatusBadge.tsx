import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import type { DelegationStatus } from "~Model"

type Props = {
    status: DelegationStatus
    exitDays?: number
}

type StatusConfig = {
    label: string
    backgroundColor: string
    blurAmount: number
}

const STATUS_COLORS = {
    DELEGATED: "rgba(48, 38, 95, 0.30)",
    EXITING: "rgba(221, 107, 32, 0.65)",
    NOT_DELEGATED: "rgba(229, 62, 62, 0.65)",
} as const

export const DelegationStatusBadge = ({ status, exitDays }: Props) => {
    const { LL } = useI18nContext()

    const config = useMemo((): StatusConfig => {
        switch (status) {
            case "ACTIVE":
            case "QUEUED":
                return {
                    label: LL.STARGATE_DELEGATION_STATUS_DELEGATED(),
                    backgroundColor: STATUS_COLORS.DELEGATED,
                    blurAmount: 30,
                }
            case "EXITING":
                return {
                    label:
                        exitDays !== undefined
                            ? LL.STARGATE_DELEGATION_STATUS_EXITING_IN_DAYS({ days: exitDays })
                            : LL.STARGATE_DELEGATION_STATUS_EXITING(),
                    backgroundColor: STATUS_COLORS.EXITING,
                    blurAmount: 65,
                }
            case "NONE":
            case "EXITED":
            default:
                return {
                    label: LL.STARGATE_DELEGATION_STATUS_NOT_DELEGATED(),
                    backgroundColor: STATUS_COLORS.NOT_DELEGATED,
                    blurAmount: 65,
                }
        }
    }, [status, exitDays, LL])

    return (
        <BaseView style={styles.container}>
            <BlurView
                blurAmount={config.blurAmount}
                style={[StyleSheet.absoluteFill, { backgroundColor: config.backgroundColor }]}
            />
            <BaseText typographyFont="captionSemiBold" color={COLORS.WHITE} numberOfLines={1}>
                {config.label}
            </BaseText>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingVertical: 4,
        alignItems: "center",
        justifyContent: "center",
    },
})
