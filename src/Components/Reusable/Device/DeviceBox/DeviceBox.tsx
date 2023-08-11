import React from "react"
import { useTheme } from "~Hooks"

import {
    BaseCard,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    LedgerBadge,
} from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"
import { StyleSheet } from "react-native"

type Props = {
    device: BaseDevice
    onDeviceSelected?: () => void
    isIconVisible?: boolean
    isEdit?: boolean
}

export const DeviceBox: React.FC<Props> = ({
    device,
    onDeviceSelected,
    isIconVisible = true,
    isEdit = false,
}) => {
    const theme = useTheme()

    return (
        <BaseCard style={styles.card} onPress={onDeviceSelected}>
            <BaseView flexDirection="row">
                {isEdit && (
                    <BaseIcon
                        name={"drag"}
                        color={theme.colors.text}
                        size={24}
                    />
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
