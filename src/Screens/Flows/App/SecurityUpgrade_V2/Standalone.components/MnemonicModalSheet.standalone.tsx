import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import {
    BaseButton,
    BaseBottomSheet,
    BaseView,
    BaseText,
    BaseSpacer,
    BaseIcon,
    MnemonicAvoidScreenshotAlert,
} from "~Components"
import { useCopyClipboard, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Wallet } from "~Model"
import { MnemonicCard } from "./MnemonicCard.standalone"

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
                <BaseView w={100}>
                    <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseView justifyContent="center">
                        <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_WARMNING()}</BaseText>

                        <BaseSpacer height={24} />
                    </BaseView>

                    <BaseView alignItems="flex-start">
                        <BaseText typographyFont="subSubTitle">{LL.SB_RECOVERY_PHRASE()}</BaseText>

                        <BaseSpacer height={16} />

                        {!!selectedWallet?.mnemonic?.length && <MnemonicCard mnemonicArray={selectedWallet.mnemonic} />}

                        <BaseSpacer height={8} />

                        <BaseButton
                            size="sm"
                            py={8}
                            variant="ghost"
                            rightIcon={
                                <BaseView ml={5}>
                                    <BaseIcon name="content-copy" size={14} color={theme.colors.text} />
                                </BaseView>
                            }
                            title={LL.BTN_MNEMONIC_CLIPBOARD()}
                            action={() =>
                                onCopyToClipboard(selectedWallet!.mnemonic!.join(" "), LL.BD_BACKUP_MNEMONIC())
                            }
                        />

                        <BaseSpacer height={16} />
                        <MnemonicAvoidScreenshotAlert />
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
