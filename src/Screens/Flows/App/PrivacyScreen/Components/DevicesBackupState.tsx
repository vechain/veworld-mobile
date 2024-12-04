import React, { useCallback, useMemo } from "react"
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

const ItemSeparator = React.memo(() => <BaseSpacer height={4} />)

export const DevicesBackupState = <T extends BaseDevice = BaseDevice>({ devices, onPress }: Props<T>) => {
    const { LL } = useI18nContext()

    const getStatusConfig = useCallback(
        (item: T): StatusConfig => {
            if (item.isBuckedUp || item.isBackedUpManual) {
                return { variant: "success" }
            }
            if (!item?.isBuckedUp && !item?.isBackedUpManual && item?.type !== DEVICE_TYPE.LEDGER) {
                return { variant: "error" }
            }
            return {
                variant: "neutral",
                statusText: LL.BD_CANT_BE_BACKED_UP(),
            }
        },
        [LL],
    )

    const keyExtractor = useCallback((device: T) => device.rootAddress, [])

    const renderDeviceItem = useCallback(
        (props: { item: T }) => {
            const { item } = props
            const { variant, statusText } = getStatusConfig(item)
            const handlePress = () => onPress(item)

            const rightElement = statusText ? (
                <BaseText typographyFont="smallCaptionRegular" color={COLORS.GREY_600}>
                    {statusText}
                </BaseText>
            ) : (
                <BaseIcon dsIcons name="icon-chevron-right" size={14} color={COLORS.DARK_PURPLE} />
            )

            return (
                <WalletBackupStatusRow
                    variant={variant}
                    title={item.alias}
                    rightElement={rightElement}
                    onPress={handlePress}
                    disabled={variant === "neutral"}
                    testID={`deviceBackupStateRow_${item.rootAddress}`}
                />
            )
        },
        [getStatusConfig, onPress],
    )

    const ListHeaderComponent = useMemo(
        () => (
            <>
                <BaseText mb={4} typographyFont="subSubTitleMedium">
                    {LL.SB_BACKUP_RECOVERY_PHRASE()}
                </BaseText>
                <BaseSpacer height={4} />
                <BaseText typographyFont="captionRegular">{LL.BD_BACKUP_RECOVERY_PHRASE()}</BaseText>
                <BaseSpacer height={16} />
            </>
        ),
        [LL],
    )

    return (
        <>
            {ListHeaderComponent}
            <CardWithHeader iconName="icon-wallet" title={LL.SB_YOUR_WALLETS()}>
                <FlatList
                    data={devices}
                    keyExtractor={keyExtractor}
                    renderItem={renderDeviceItem}
                    ItemSeparatorComponent={ItemSeparator}
                    showsVerticalScrollIndicator={false}
                />
            </CardWithHeader>
        </>
    )
}
