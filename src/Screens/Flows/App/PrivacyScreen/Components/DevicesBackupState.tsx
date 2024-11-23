import React, { useCallback } from "react"
import { FlatList } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, CardWithHeader, WalletBackupStatusRow } from "~Components"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { BaseDevice, DEVICE_TYPE } from "~Model"

type Props<T extends BaseDevice = BaseDevice> = {
    devices: T[]
    onPress: (device: T) => void
}

type StatusConfig = {
    variant: "success" | "error" | "neutral"
    statusText?: string
}

export const DevicesBackupState = <T extends BaseDevice = BaseDevice>({ devices, onPress }: Props<T>) => {
    const { LL } = useI18nContext()

    const getStatusConfig = useCallback(
        (item: T): StatusConfig => {
            if (item.isBuckedUp) {
                return {
                    variant: "success",
                }
            }
            if (!item?.isBuckedUp && item?.type === DEVICE_TYPE.LOCAL_MNEMONIC) {
                return {
                    variant: "error",
                }
            }
            return {
                variant: "neutral",
                statusText: LL.BD_CANT_BE_BACKED_UP(),
            }
        },
        [LL],
    )

    const renderItemSeparator = useCallback(() => <BaseSpacer height={4} />, [])

    const renderDeviceItem = useCallback(
        (props: { item: T }) => {
            const { item } = props
            const { variant, statusText } = getStatusConfig(item)

            return (
                <WalletBackupStatusRow
                    variant={variant}
                    title={item.alias}
                    rightElement={
                        statusText ? (
                            <BaseText typographyFont="smallCaptionRegular" color={COLORS.GREY_600}>
                                {statusText}
                            </BaseText>
                        ) : (
                            <BaseIcon name="chevron-right" size={14} color={COLORS.DARK_PURPLE} />
                        )
                    }
                    onPress={() => onPress(item)}
                />
            )
        },
        [getStatusConfig, onPress],
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
