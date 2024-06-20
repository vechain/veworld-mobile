import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, MnemonicCard, BaseBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
import { useCloudKit, useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { LocalDevice } from "~Model"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
    onClose: () => void
}

export const BackupMnemonicBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ mnemonicArray, deviceToBackup }, ref) => {
        const { LL } = useI18nContext()

        const { styles, theme } = useThemedStyles(baseStyles)

        const { isCloudKitAvailable, saveWalletToCloudKit } = useCloudKit(deviceToBackup)

        const { onCopyToClipboard } = useCopyClipboard()

        return (
            <BaseBottomSheet dynamicHeight ref={ref}>
                <BaseView flexDirection="row" w={100}>
                    <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseView justifyContent="center">
                    <BaseView flexDirection="row" alignSelf="center">
                        <BaseIcon name="apple-icloud" size={24} color={theme.colors.text} />
                        <BaseSpacer width={8} />
                        <BaseText>{"Backed up to iCloud"}</BaseText>
                    </BaseView>

                    <BaseSpacer height={24} />

                    <BaseText>
                        {
                            // eslint-disable-next-line max-len
                            "Never share these words. Anyone who learns them can steal all of your crypto. VeWorld will never ask you for them."
                        }
                    </BaseText>

                    <BaseSpacer height={16} />

                    <BaseText>
                        {
                            // eslint-disable-next-line max-len
                            "The 12 words below are your wallet's recovery phrase. This phrase lets you recover your wallet if you lose your device. Back up it up on iCloud (recommended) or write it down. Or both."
                        }
                    </BaseText>

                    <BaseSpacer height={36} />
                </BaseView>

                <BaseView alignItems="flex-start" mb={16}>
                    <MnemonicCard mnemonicArray={mnemonicArray} souceScreen="BackupMnemonicBottomSheet" />

                    <BaseSpacer height={16} />

                    <BaseButton
                        size="sm"
                        variant="ghost"
                        selfAlign="flex-start"
                        action={() => onCopyToClipboard(mnemonicArray.join(" "), LL.TITLE_MNEMONIC())}
                        title={LL.BTN_MNEMONIC_CLIPBOARD()}
                        disabled={!mnemonicArray.length}
                        rightIcon={
                            <BaseIcon name="content-copy" color={theme.colors.text} size={12} style={styles.icon} />
                        }
                    />

                    <BaseSpacer height={56} />

                    {isCloudKitAvailable && (
                        <BaseButton w={100} action={saveWalletToCloudKit} title={"Back up on iCloud"} />
                    )}
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
    })
