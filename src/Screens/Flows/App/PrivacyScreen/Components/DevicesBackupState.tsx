import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView, CardWithHeader } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BaseDevice, DEVICE_TYPE } from "~Model"

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

export const DevicesBackupState = <T extends BaseDevice = BaseDevice>({ devices, onPress }: Props<T>) => {
    const { LL } = useI18nContext()

    const { styles } = useThemedStyles(baseStyles)

    const getStatusConfig = useCallback((item: T): StatusConfig => {
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

        if (item.isBuckedUp) return statusConfigs.backedUp
        if (!item?.isBuckedUp && item?.type === DEVICE_TYPE.LOCAL_MNEMONIC) return statusConfigs.needsBackup
        return statusConfigs.unableToBackup
    }, [])

    const renderItemSeparator = useCallback(() => <BaseSpacer height={4} />, [])

    const renderDeviceItem = useCallback(
        (props: { item: T }) => {
            const { item } = props
            const itemConfig = getStatusConfig(item)

            return (
                <BaseTouchableBox
                    testID={`deviceBackupStateRow_${item.rootAddress}`}
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
                        <BaseText typographyFont="buttonSecondary" color={itemConfig.textColor ?? COLORS.DARK_PURPLE}>
                            {item.alias}
                        </BaseText>
                    </BaseView>
                    {itemConfig.statusText ? (
                        <BaseText
                            typographyFont="smallCaptionRegular"
                            color={itemConfig.textColor ?? COLORS.DARK_PURPLE}>
                            {itemConfig.statusText}
                        </BaseText>
                    ) : (
                        <BaseIcon name="chevron-right" size={12} color={COLORS.DARK_PURPLE} />
                    )}
                </BaseTouchableBox>
            )
        },
        [getStatusConfig, onPress, styles.deviceInfo, styles.deviceRow, styles.deviceRowContent],
    )

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
                    renderItem={renderDeviceItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    showsVerticalScrollIndicator={false}
                />
            </CardWithHeader>
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        walletIcon: {
            backgroundColor: COLORS.GREY_200,
            color: COLORS.GREY_600,
            height: 24,
            width: 24,
            borderRadius: 4.5,
        },
        cardContainer: {
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.colors.cardBorder,
        },
        card: {
            flexDirection: "column",
            padding: 16,
        },
        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
        },
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
