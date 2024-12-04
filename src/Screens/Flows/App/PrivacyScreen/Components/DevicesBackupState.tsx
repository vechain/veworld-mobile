import React, { useCallback, useMemo } from "react"
import { FlatList } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, CardWithHeader, WalletBackupStatusRow } from "~Components"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { BaseDevice, DEVICE_TYPE, LocalDevice } from "~Model"

type Props = {
    devices: BaseDevice[]
    onPress: (device: LocalDevice) => void
}

type StatusConfig = {
    variant: "success" | "error" | "neutral"
    statusText?: string
}

const ItemSeparator = React.memo(() => <BaseSpacer height={4} />)

export const DevicesBackupState = ({ devices, onPress }: Props) => {
    const { LL } = useI18nContext()

    const handlePress = useCallback(
        (device: BaseDevice) => {
            if (device.type !== DEVICE_TYPE.LEDGER) {
                onPress(device as LocalDevice)
            }
        },
        [onPress],
    )

    const getStatusConfig = useCallback(
        (item: BaseDevice): StatusConfig => {
            if (item.type === DEVICE_TYPE.LEDGER) {
                return {
                    variant: "neutral",
                    statusText: LL.BD_CANT_BE_BACKED_UP(),
                }
            }
            if (item.isBuckedUp || item.isBackedUpManual) {
                return { variant: "success" }
            }
            return { variant: "error" }
        },
        [LL],
    )

    const keyExtractor = useCallback((device: BaseDevice) => device.rootAddress, [])

    const renderDeviceItem = useCallback(
        (props: { item: BaseDevice }) => {
            const { item } = props
            const { variant, statusText } = getStatusConfig(item)

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
                    onPress={() => handlePress(item)}
                    disabled={variant === "neutral"}
                    testID={`deviceBackupStateRow_${item.rootAddress}`}
                />
            )
        },
        [handlePress, getStatusConfig],
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
