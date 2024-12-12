import React, { FC } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseSpacer, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"

type Props = {
    onConfirmTitle: string
    onRejectTitle: string
    onConfirm: () => void
    onReject: () => void
    confirmButtonDisabled?: boolean
    isConfirmLoading?: boolean
    rejectButtonDisabled?: boolean
    isRejectLoading?: boolean
}

export const SignAndReject: FC<Props> = React.memo(
    ({
        onConfirmTitle,
        onRejectTitle,
        onConfirm,
        onReject,
        confirmButtonDisabled = false,
        isConfirmLoading = false,
        rejectButtonDisabled = false,
        isRejectLoading = false,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        return (
            <BaseView style={styles.rootContainer}>
                <BaseButton
                    w={100}
                    haptics="Light"
                    title={onConfirmTitle}
                    action={onConfirm}
                    isLoading={isConfirmLoading}
                    disabled={confirmButtonDisabled}
                />
                <BaseSpacer height={16} />
                <BaseButton
                    w={100}
                    haptics="Light"
                    variant="outline"
                    title={onRejectTitle}
                    action={onReject}
                    isLoading={isRejectLoading}
                    disabled={rejectButtonDisabled}
                    style={{ backgroundColor: theme.colors.background }}
                />
            </BaseView>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            height: 194,
            width: "100%",
            padding: 24,
            alignItems: "center",
        },
    })
