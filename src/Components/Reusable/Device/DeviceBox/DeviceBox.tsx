import React, { useCallback } from "react"
import { useThemedStyles } from "~Hooks"

import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView, LedgerBadge, WatchedAccountBadge } from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"
import { Pressable, StyleSheet, ViewStyle } from "react-native"
import { ColorThemeType, DerivationPath } from "~Constants"
import { TouchableOpacity } from "react-native-gesture-handler"

type Props = {
    device?: BaseDevice
    onDeviceSelected?: (item: BaseDevice) => () => void
    isIconVisible?: boolean
    isEdit?: boolean
    drag?: () => void
    isActive?: boolean
    cardStyle?: ViewStyle
    testID?: string
}

export const DeviceBox: React.FC<Props> = ({
    device,
    isIconVisible = true,
    isEdit = false,
    onDeviceSelected,
    drag,
    isActive = true,
    cardStyle,
    testID,
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
            <BaseCard style={[styles.card, cardStyle]} testID="DeviceBox">
                <BaseView flexDirection="row" flex={1}>
                    {isEdit && (
                        <>
                            <Pressable onPressIn={isEdit ? drag : undefined} disabled={isActive}>
                                <BaseIcon name={"drag"} color={theme.colors.text} size={24} />
                            </Pressable>
                            <BaseSpacer width={8} />
                        </>
                    )}
                    {device?.type === DEVICE_TYPE.LEDGER && (
                        <>
                            <LedgerBadge />
                            <BaseSpacer width={8} />
                        </>
                    )}

                    {device?.derivationPath === DerivationPath.ETH && (
                        <>
                            <BaseIcon name="ethereum" size={24} color={theme.colors.textDisabled} />
                            <BaseSpacer width={8} />
                        </>
                    )}

                    {device?.type === DEVICE_TYPE.LOCAL_WATCHED && (
                        <>
                            <WatchedAccountBadge />
                            <BaseSpacer width={8} />
                        </>
                    )}
                    <BaseView flex={1}>
                        <BaseText typographyFont="subTitleBold" ellipsizeMode="tail" numberOfLines={1}>
                            {device?.alias}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseSpacer width={12} />
                {isIconVisible && !isEdit && <BaseIcon name={"pencil-outline"} color={theme.colors.text} size={24} />}
            </BaseCard>
        ),
        [
            cardStyle,
            device?.alias,
            device?.derivationPath,
            device?.type,
            drag,
            isActive,
            isEdit,
            isIconVisible,
            styles.card,
            theme.colors.text,
            theme.colors.textDisabled,
        ],
    )

    return onDeviceSelected ? (
        <BaseView style={styles.touchableContainer}>
            <PressableComponent
                testID={testID}
                disabled={!isActive}
                style={styles.deviceBoxPressable}
                onPress={isEdit ? undefined : onDeviceSelected?.(device!)}>
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
