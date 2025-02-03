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
    credential: string[] | string
    deviceToBackup?: LocalDevice
}
export const CopyCredentialButton = memo(({ credential, deviceToBackup }: Props) => {
    const { LL, locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()
    const dispatch = useAppDispatch()

    const isMnemonic = Array.isArray(credential)

    const handleCopyToClipboard = useCallback(() => {
        onCopyToClipboard(
            isMnemonic ? credential.join(" ") : credential,
            isMnemonic ? LL.BTN_BACKUP_MENMONIC() : LL.BTN_BACKUP_PK(),
        )
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
        isMnemonic,
        credential,
        dispatch,
        onCopyToClipboard,
        LL,
    ])

    return (
        <BaseButton
            px={0}
            py={4}
            testID="Copy_To_Clipboard_Btn"
            size="sm"
            variant="ghost"
            selfAlign="flex-start"
            action={handleCopyToClipboard}
            title={LL.BTN_MNEMONIC_CLIPBOARD()}
            typographyFont="smallButtonPrimary"
            disabled={!credential.length}
            textColor={theme.colors.text}
            rightIcon={<BaseIcon name="icon-copy" color={theme.colors.text} size={12} style={styles.icon} />}
        />
    )
})

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
    })
