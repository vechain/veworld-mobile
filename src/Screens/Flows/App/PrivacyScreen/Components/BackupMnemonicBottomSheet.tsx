import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    MnemonicCard,
    BaseBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useCopyClipboard, useThemedStyles } from "~Common"
import { StyleSheet } from "react-native"

type Props = {
    mnemonicArray: string[]
    onClose: () => void
}

const snapPoints = ["45%"]

export const BackupMnemonicBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ mnemonicArray }, ref) => {
    const { LL } = useI18nContext()

    const { styles, theme } = useThemedStyles(baseStyles)

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BTN_BACKUP_MENMONIC()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseView alignItems="flex-start">
                <MnemonicCard mnemonicArray={mnemonicArray} />

                <BaseSpacer height={16} />

                <BaseButton
                    size="sm"
                    selfAlign="flex-end"
                    action={() =>
                        onCopyToClipboard(
                            mnemonicArray.join(" "),
                            LL.TITLE_MNEMONIC(),
                        )
                    }
                    w={100}
                    title={LL.BTN_MNEMONIC_CLIPBOARD()}
                    disabled={!mnemonicArray.length}
                    rightIcon={
                        <BaseIcon
                            name="content-copy"
                            color={theme.colors.card}
                            size={12}
                            style={styles.icon}
                        />
                    }
                />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
    })
