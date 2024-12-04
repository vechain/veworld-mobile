import { BaseButton, BaseIcon } from "~Components"
import { LocalDevice } from "~Model"
import React, { memo, useCallback } from "react"
import { formatDateTime } from "~Utils/DateUtils/DateUtils"
import { getTimeZone } from "react-native-localize"
import { DateUtils } from "~Utils"
import { setDeviceIsBackup, useAppDispatch } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}
export const CopyMnemonicButton = memo(({ mnemonicArray, deviceToBackup }: Props) => {
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
                    isBackup: !!deviceToBackup.isBuckedUp,
                    isBackupManual: true,
                    date: formattedDate,
                }),
            )
        }
    }, [
        deviceToBackup?.rootAddress,
        deviceToBackup?.isBuckedUp,
        locale,
        mnemonicArray,
        dispatch,
        onCopyToClipboard,
        LL,
    ])

    return (
        <BaseButton
            px={0}
            py={4}
            size="sm"
            variant="ghost"
            selfAlign="flex-start"
            action={handleCopyToClipboard}
            title={LL.BTN_MNEMONIC_CLIPBOARD()}
            typographyFont="smallButtonPrimary"
            disabled={!mnemonicArray.length}
            textColor={theme.colors.text}
            rightIcon={<BaseIcon dsIcons name="icon-copy" color={theme.colors.text} size={12} style={styles.icon} />}
        />
    )
})

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
    })
