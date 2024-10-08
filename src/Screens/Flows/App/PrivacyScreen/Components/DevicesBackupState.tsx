import React, { useCallback } from "react"
import { useTheme, useThemedStyles } from "~Hooks"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { COLORS, ColorThemeType } from "~Constants"
import { FlatList, StyleSheet } from "react-native"
import { BaseDevice, DEVICE_TYPE } from "~Model"

type Props<T extends BaseDevice = BaseDevice> = {
    devices: T[]
}

type StatusConfig = {
    iconName: string
    iconColor: string
    backgroundColor: string
    borderColor: string
    statusText?: string
    textColor?: string
}

export const DevicesBackupState = <T extends BaseDevice = BaseDevice>({ devices }: Props<T>) => {
    const { LL } = useI18nContext()

    const { styles } = useThemedStyles(baseStyles)
    const theme = useTheme()

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
                statusText: "Can't be backed up",
                textColor: COLORS.GREY_600,
            },
        }

        if (item.isBuckedUp) return statusConfigs.backedUp
        if (!item?.isBuckedUp && item?.type === DEVICE_TYPE.LOCAL_MNEMONIC) return statusConfigs.needsBackup
        return statusConfigs.unableToBackup
    }, [])

    const renderDeviceItem = useCallback(
        ({ item }: { item: T }) => {
            const { iconName, iconColor, backgroundColor, borderColor, statusText, textColor } = getStatusConfig(item)

            return (
                <BaseTouchableBox
                    containerStyle={[styles.deviceRow, { backgroundColor, borderColor }]}
                    style={styles.deviceRowContent}>
                    <BaseView style={styles.deviceInfo}>
                        <BaseIcon name={iconName} size={18} color={iconColor} />
                        <BaseSpacer width={12} />
                        <BaseText typographyFont="buttonSecondary" color={textColor || COLORS.DARK_PURPLE}>
                            {item.alias}
                        </BaseText>
                    </BaseView>
                    {statusText ? (
                        <BaseText typographyFont="captionMedium" color={textColor || COLORS.DARK_PURPLE}>
                            {statusText}
                        </BaseText>
                    ) : (
                        <BaseIcon name="chevron-right" size={12} color={COLORS.DARK_PURPLE} />
                    )}
                </BaseTouchableBox>
            )
        },
        [getStatusConfig, styles],
    )

    return (
        <>
            <BaseText mb={8} typographyFont="button">
                {LL.SB_BACKUP_RECOVERY_PHRASE()}
            </BaseText>
            <BaseText typographyFont="captionRegular">{LL.BD_BACKUP_RECOVERY_PHRASE()}</BaseText>

            <BaseSpacer height={24} />

            <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
                <BaseView style={styles.cardHeader}>
                    <BaseIcon name="wallet-outline" size={12} style={styles.walletIcon} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="captionMedium" color={theme.colors.text}>
                        {"Your wallets"}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={12} />
                <FlatList
                    data={devices}
                    keyExtractor={device => device.rootAddress}
                    renderItem={renderDeviceItem}
                    ItemSeparatorComponent={() => <BaseSpacer height={4} />}
                    showsVerticalScrollIndicator={false}
                />
            </BaseCard>
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
