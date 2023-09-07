import React from "react"

import {
    BaseCard,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    LedgerBadge,
} from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"
import { Pressable, StyleSheet } from "react-native"
import { useTheme } from "~Hooks"

type Props = {
    device: BaseDevice
    isIconVisible?: boolean
    isEdit?: boolean
    drag?: () => void
    isActive?: boolean
}

export const DeviceBox: React.FC<Props> = ({
    device,
    isIconVisible = true,
    isEdit = false,
    drag,
    isActive = false,
}) => {
    const theme = useTheme()
    return (
        <BaseCard style={styles.card}>
            <BaseView flexDirection="row">
                {isEdit && (
                    <Pressable
                        onPressIn={isEdit ? drag : undefined}
                        disabled={isActive}>
                        <BaseIcon
                            name={"drag"}
                            color={theme.colors.text}
                            size={24}
                        />
                    </Pressable>
                )}
                <BaseSpacer width={8} />
                <BaseText typographyFont="subTitleBold">
                    {device.alias}
                </BaseText>
                <BaseSpacer width={8} />
                {device.type === DEVICE_TYPE.LEDGER && <LedgerBadge />}
            </BaseView>
            {isIconVisible && !isEdit && (
                <BaseIcon
                    name={"pencil-outline"}
                    color={theme.colors.text}
                    size={24}
                />
            )}
        </BaseCard>
    )
}

const styles = StyleSheet.create({
    card: {
        justifyContent: "space-between",
    },
})
