import React, { useCallback, useMemo } from "react"
import { useThemedStyles } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"
import { FlatList, StyleSheet, ViewStyle } from "react-native"
import { BaseDevice, DEVICE_TYPE } from "~Model"
import { CardWithHeader } from "~Components/Reusable/CardWithHeader"

type Props<T extends BaseDevice = BaseDevice> = {
    devices: T[]
    onPress: (device: T) => void
}

type StatusConfig = {
    iconName: string
    iconColor: string
    backgroundColor: string
    borderColor: string
    statusText?: string
    textColor?: string
}

type StatusStyles = {
    deviceRow: ViewStyle
    deviceRowContent: ViewStyle
    deviceInfo: ViewStyle
}

const statusConfigs: Record<string, StatusConfig> = {
    backedUp: {
        iconName: "check-circle-outline",
        iconColor: COLORS.GREEN_500,
        backgroundColor: COLORS.GREEN_50,
        borderColor: COLORS.GREEN_100,
    },
    needsBackup: {
        iconName: "close-circle-outline",
        iconColor: COLORS.RED_500,
        backgroundColor: COLORS.RED_50,
        borderColor: COLORS.RED_100,
    },
    unableToBackup: {
        iconName: "information-outline",
        iconColor: COLORS.GREY_500,
        backgroundColor: COLORS.GREY_100,
        borderColor: COLORS.GREY_200,
        statusText: "(Can't be backed up)",
        textColor: COLORS.GREY_600,
    },
}

const getStatusConfig = (device: BaseDevice): StatusConfig => {
    if (device.isBuckedUp || device.isBackedUpOnCloud) return statusConfigs.backedUp
    if (!device.isBuckedUp && device.type === DEVICE_TYPE.LOCAL_MNEMONIC) return statusConfigs.needsBackup
    return statusConfigs.unableToBackup
}

const DeviceItem = React.memo(
    <T extends BaseDevice>({
        item,
        onPress,
        styles,
    }: {
        item: T
        onPress: (device: T) => void
        styles: StatusStyles
    }) => {
        const itemConfig = useMemo(() => getStatusConfig(item), [item])
        return (
            <BaseTouchableBox
                containerStyle={[
                    styles.deviceRow,
                    { backgroundColor: itemConfig.backgroundColor, borderColor: itemConfig.borderColor },
                ]}
                style={styles.deviceRowContent}
                action={() => onPress(item)}
                haptics="Medium">
                <BaseView style={styles.deviceInfo}>
                    <BaseIcon name={itemConfig.iconName} size={18} color={itemConfig.iconColor} />
                    <BaseSpacer width={12} />
                    <BaseText typographyFont="buttonSecondary" color={itemConfig.textColor || COLORS.DARK_PURPLE}>
                        {item.alias}
                    </BaseText>
                </BaseView>
                {itemConfig.statusText ? (
                    <BaseText typographyFont="smallCaptionRegular" color={itemConfig.textColor || COLORS.DARK_PURPLE}>
                        {itemConfig.statusText}
                    </BaseText>
                ) : (
                    <BaseIcon name="chevron-right" size={12} color={COLORS.DARK_PURPLE} />
                )}
            </BaseTouchableBox>
        )
    },
)
export const DevicesBackupState = <T extends BaseDevice = BaseDevice>({ devices, onPress }: Props<T>) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const renderItemSeparator = useCallback(() => <BaseSpacer height={4} />, [])

    return (
        <>
            <BaseText mb={4} typographyFont="subSubTitleMedium">
                {LL.SB_BACKUP_RECOVERY_PHRASE()}
            </BaseText>
            <BaseSpacer height={4} />
            <BaseText typographyFont="captionRegular">{LL.BD_BACKUP_RECOVERY_PHRASE()}</BaseText>

            <BaseSpacer height={16} />

            <CardWithHeader iconName="wallet-outline" title={LL.SB_YOUR_WALLETS()}>
                <FlatList
                    data={devices}
                    keyExtractor={device => device.rootAddress}
                    renderItem={({ item }) => <DeviceItem item={item} onPress={() => onPress(item)} styles={styles} />}
                    ItemSeparatorComponent={renderItemSeparator}
                    showsVerticalScrollIndicator={false}
                />
            </CardWithHeader>
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        deviceRow: {
            borderRadius: 8,
            borderWidth: 1,
        },
        deviceRowContent: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 14,
        },
        deviceInfo: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
    })
