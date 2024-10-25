import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, MnemonicBackupAlert, MnemonicCard } from "~Components"
import { DoNotShareAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components/DoNotShareAlert"
import React, { FC } from "react"
import { useI18nContext } from "~i18n"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { IconHeaderCard } from "~Components/Reusable/IconHeaderCard"

type Props = {
    mnemonicArray: string[]
}

export const ManualBackupCard: FC<Props> = ({ mnemonicArray }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <IconHeaderCard title={LL.TITLE_BACKUP_MANUALLY()} iconName="pencil-outline">
            <BaseView>
                <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>
                <BaseSpacer height={12} />
                <DoNotShareAlert />
                <BaseSpacer height={12} />
                {!!mnemonicArray.length && (
                    <MnemonicCard mnemonicArray={mnemonicArray} souceScreen="BackupMnemonicBottomSheet" />
                )}
                <BaseSpacer height={12} />
                <BaseButton
                    px={0}
                    py={0}
                    size="sm"
                    variant="ghost"
                    selfAlign="flex-start"
                    action={() => onCopyToClipboard(mnemonicArray.join(" "), LL.BTN_BACKUP_MENMONIC())}
                    title={LL.BTN_MNEMONIC_CLIPBOARD()}
                    typographyFont="smallButtonPrimary"
                    disabled={!mnemonicArray.length}
                    textColor={theme.colors.text}
                    rightIcon={<BaseIcon name="content-copy" color={theme.colors.text} size={12} style={styles.icon} />}
                />
            </BaseView>
            <BaseSpacer height={12} />
            <MnemonicBackupAlert />
        </IconHeaderCard>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        card: {
            flexDirection: "column",
            padding: 16,
        },
        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
        },
        icon: {
            marginLeft: 6,
        },
    })
