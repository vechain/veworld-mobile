import React, { useCallback } from "react"
import { useThemedStyles } from "~Hooks"

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
import { ColorThemeType } from "~Constants"
import { TouchableOpacity } from "react-native-gesture-handler"

type Props = {
    device: BaseDevice
    onDeviceSelected?: (item: BaseDevice) => () => void
    isIconVisible?: boolean
    isEdit?: boolean
    drag?: () => void
    isActive?: boolean
}

export const DeviceBox: React.FC<Props> = ({
    device,
    isIconVisible = true,
    isEdit = false,
    onDeviceSelected,
    drag,
    isActive = false,
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    /**
     * this is workaround for draggable flatlist
     * TouchableOpacity is not draggable in edit mode
     * Pressable has issues with swipeable row when is not edit mode
     */
    const PressableComponent = isEdit ? Pressable : TouchableOpacity

    const deviceBoxBody = useCallback(
        () => (
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
        ),
        [
            device.alias,
            device.type,
            drag,
            isActive,
            isEdit,
            isIconVisible,
            styles.card,
            theme.colors.text,
        ],
    )

    return onDeviceSelected ? (
        <BaseView style={styles.touchableContainer}>
            <PressableComponent
                disabled={isActive}
                style={styles.deviceBoxPressable}
                onPress={isEdit ? undefined : onDeviceSelected?.(device)}>
                {deviceBoxBody()}
            </PressableComponent>
        </BaseView>
    ) : (
        deviceBoxBody()
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            justifyContent: "space-between",
        },
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        deviceBoxPressable: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
    })
