import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { BaseButton, BaseBottomSheet, BaseView, BaseText, BaseSpacer, MnemonicCard, BaseIcon } from "~Components"
import { useCopyClipboard, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Wallet } from "~Model"

type Props = {
    selectedWallet: Wallet | null
}

export const MnemonicModalSheetStandalone = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ selectedWallet }, ref) => {
        const theme = useTheme()
        const { LL } = useI18nContext()
        const { onCopyToClipboard } = useCopyClipboard()

        return (
            <BaseBottomSheet ref={ref}>
                <BaseView w={100} px={24}>
                    <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseView justifyContent="center">
                        <BaseText typographyFont="body">{LL.BD_MNEMONIC_WARMNING()}</BaseText>

                        <BaseSpacer height={26} />
                    </BaseView>

                    <BaseView alignItems="flex-start">
                        {!!selectedWallet?.mnemonic?.length && <MnemonicCard mnemonicArray={selectedWallet.mnemonic} />}
                        <BaseSpacer height={16} />

                        <BaseButton
                            size="sm"
                            py={8}
                            radius={8}
                            rightIcon={
                                <BaseView ml={5}>
                                    <BaseIcon name="content-copy" size={14} color={theme.colors.textReversed} />
                                </BaseView>
                            }
                            title={LL.BTN_MNEMONIC_CLIPBOARD()}
                            action={() =>
                                onCopyToClipboard(selectedWallet!.mnemonic!.join(" "), LL.BD_BACKUP_MNEMONIC())
                            }
                        />
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
