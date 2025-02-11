import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    AvoidScreenshotAlert,
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
        const backupDetails = selectedWallet?.privateKey ?? selectedWallet?.mnemonic
        const isMnemonic = Array.isArray(backupDetails)
        return (
            <BaseBottomSheet ref={ref}>
                <BaseView w={100}>
                    <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseView justifyContent="center">
                        <BaseText typographyFont="captionRegular">
                            {isMnemonic ? LL.BD_MNEMONIC_WARMNING() : LL.BD_PRIVATE_KEY_WARMNING()}
                        </BaseText>

                        <BaseSpacer height={24} />
                    </BaseView>

                    <BaseView alignItems="flex-start">
                        <BaseText typographyFont="subSubTitle">
                            {isMnemonic ? LL.SB_RECOVERY_PHRASE() : LL.SB_PRIVATE_KEY()}
                        </BaseText>

                        <BaseSpacer height={16} />

                        {!!selectedWallet?.mnemonic?.length && <MnemonicCard mnemonicArray={selectedWallet.mnemonic} />}

                        <BaseSpacer height={8} />

                        <BaseButton
                            size="sm"
                            py={8}
                            variant="ghost"
                            rightIcon={
                                <BaseView ml={5}>
                                    <BaseIcon name="icon-copy" size={14} color={theme.colors.text} />
                                </BaseView>
                            }
                            title={LL.BTN_MNEMONIC_CLIPBOARD()}
                            action={() =>
                                onCopyToClipboard(selectedWallet!.mnemonic!.join(" "), LL.BD_BACKUP_MNEMONIC())
                            }
                        />

                        <BaseSpacer height={16} />
                        {backupDetails && <AvoidScreenshotAlert backupDetails={backupDetails} />}
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
