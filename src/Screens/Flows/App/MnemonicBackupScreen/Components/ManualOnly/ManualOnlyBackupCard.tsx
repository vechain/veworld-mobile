import { BaseButton, BaseCard, BaseIcon, BaseSpacer, BaseView, MnemonicCard } from "~Components"
import { DoNotShareAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components"
import React, { memo, useCallback } from "react"
import { useI18nContext } from "~i18n"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { setDeviceIsBackup, useAppDispatch } from "~Storage/Redux"
import { LocalDevice } from "~Model"
import { formatDateTime } from "~Utils/DateUtils/DateUtils"
import { getTimeZone } from "react-native-localize"
import { DateUtils } from "~Utils"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualBackupCard = memo(({ mnemonicArray, deviceToBackup }: Props) => {
    const { LL, locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()
    const dispatch = useAppDispatch()

    const handleCopyToClipboard = useCallback(() => {
        onCopyToClipboard(mnemonicArray.join(" "), LL.BTN_BACKUP_MENMONIC())
        if (deviceToBackup?.rootAddress) {
            const formattedDate = formatDateTime(Date.now(), locale, getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE)
            dispatch(
                setDeviceIsBackup({
                    rootAddress: deviceToBackup.rootAddress,
                    isBackup: true,
                    date: formattedDate,
                }),
            )
        }
    }, [deviceToBackup?.rootAddress, locale, mnemonicArray, dispatch, onCopyToClipboard, LL])

    return (
        <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
            <BaseView px={18} py={16}>
                <DoNotShareAlert />
                <BaseSpacer height={12} />
                {!!mnemonicArray.length && (
                    <MnemonicCard
                        mnemonicArray={mnemonicArray}
                        souceScreen="BackupMnemonicBottomSheet"
                        deviceToBackup={deviceToBackup}
                    />
                )}
                <BaseSpacer height={16} />
                <BaseButton
                    px={0}
                    py={0}
                    size="sm"
                    variant="ghost"
                    selfAlign="flex-start"
                    action={handleCopyToClipboard}
                    title={LL.BTN_MNEMONIC_CLIPBOARD()}
                    typographyFont="smallButtonPrimary"
                    disabled={!mnemonicArray.length}
                    textColor={theme.colors.text}
                    rightIcon={<BaseIcon name="content-copy" color={theme.colors.text} size={12} style={styles.icon} />}
                />
            </BaseView>
        </BaseCard>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            paddingVertical: 0,
        },
        cardContainer: {
            display: "flex",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : theme.colors.cardBorder,
        },
        icon: {
            marginLeft: 6,
        },
    })
