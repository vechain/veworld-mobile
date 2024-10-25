import { BaseButton, BaseCard, BaseIcon, BaseSpacer, BaseView, MnemonicCard } from "~Components"
import { DoNotShareAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components"
import React, { FC } from "react"
import { useI18nContext } from "~i18n"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

type Props = {
    mnemonicArray: string[]
}

export const ManualOnlyBackupCard: FC<Props> = ({ mnemonicArray }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
            <BaseView px={18} py={16}>
                <DoNotShareAlert />
                <BaseSpacer height={12} />
                {!!mnemonicArray.length && (
                    <MnemonicCard mnemonicArray={mnemonicArray} souceScreen="BackupMnemonicBottomSheet" />
                )}
                <BaseSpacer height={16} />
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
        </BaseCard>
    )
}

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
