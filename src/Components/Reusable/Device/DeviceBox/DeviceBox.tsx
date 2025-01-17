import React, { useCallback, useMemo } from "react"
import { useThemedStyles } from "~Hooks"

import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView, LedgerBadge, WatchedAccountBadge } from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"
import { Pressable, StyleSheet, ViewStyle } from "react-native"
import { ColorThemeType, DerivationPath } from "~Constants"
import { TouchableOpacity } from "react-native-gesture-handler"
import { selectAccountsByDevice, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

type Props = {
    device?: BaseDevice
    onDeviceSelected?: (item: BaseDevice) => () => void
    isIconVisible?: boolean
    isEdit?: boolean
    drag?: () => void
    isActive?: boolean
    cardStyle?: ViewStyle
    testID?: string
    showWarningLabel?: boolean
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
    showWarningLabel = false,
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const deviceAccounts = useAppSelector(state => selectAccountsByDevice(state, device?.rootAddress))
    const currentAccount = useAppSelector(selectSelectedAccount)

    const isChildSelected = useMemo(() => {
        return deviceAccounts.some(account => AddressUtils.compareAddresses(account.address, currentAccount.address))
    }, [currentAccount, deviceAccounts])

    /**
     * this is workaround for draggable flatlist
     * TouchableOpacity is not draggable in edit mode
     * Pressable has issues with swipeable row when is not edit mode
     */
    const PressableComponent = isEdit ? Pressable : TouchableOpacity

    const deviceBoxBody = useCallback(
        () => (
            <BaseCard style={[styles.card, cardStyle]} testID="DeviceBox" selected={isChildSelected}>
                <BaseView flexDirection="row" flex={1}>
                    {isEdit && (
                        <>
                            <Pressable onPressIn={isEdit ? drag : undefined} disabled={isActive}>
                                <BaseIcon name="icon-grip-vertical" color={theme.colors.text} size={24} />
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
                            <BaseIcon name="icon-ethereum" size={20} color={theme.colors.textDisabled} />
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
                        <BaseText
                            typographyFont={isChildSelected ? "bodyBold" : "bodyMedium"}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            mb={6}
                            color={theme.colors.text}>
                            {device?.alias}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">{`${deviceAccounts.length} accounts`}</BaseText>
                    </BaseView>
                </BaseView>
                <BaseSpacer width={12} />

                {isIconVisible && <BaseIcon name="icon-chevron-right" color={theme.colors.text} size={16} />}

                {showWarningLabel && (
                    <BaseView flexDirection="row">
                        <BaseSpacer width={12} />
                        <BaseView flexDirection="column" justifyContent="center">
                            <BaseView style={styles.warningLabel} />
                        </BaseView>
                    </BaseView>
                )}
            </BaseCard>
        ),
        [
            cardStyle,
            device?.alias,
            device?.derivationPath,
            device?.type,
            deviceAccounts.length,
            drag,
            isActive,
            isChildSelected,
            isEdit,
            isIconVisible,
            showWarningLabel,
            styles,
            theme,
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
            borderRadius: 8,
        },
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 8,
        },
        deviceBoxPressable: {
            backgroundColor: theme.colors.card,
            borderRadius: 8,
        },
        warningLabel: {
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: theme.colors.danger,
        },
    })
