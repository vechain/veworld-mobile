import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    CustomTokenCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FungibleToken, FungibleTokenWithBalance } from "~Model"

type Props = {
    tokenToRemove?: FungibleTokenWithBalance
    onConfirmRemoveToken: () => void
    onClose: () => void
}

const snapPoints = ["45%"]

export const RemoveCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ tokenToRemove, onConfirmRemoveToken, onClose }, ref) => {
    const { LL } = useI18nContext()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                w={100}
                h={100}
                flexGrow={1}
                justifyContent="space-between">
                <BaseView>
                    <BaseView
                        flexDirection="row"
                        justifyContent="space-between"
                        w={100}
                        alignItems="center">
                        <BaseText typographyFont="subTitleBold">
                            {LL.MANAGE_CUSTOM_TOKENS_DELETE_TITLE()}
                        </BaseText>
                    </BaseView>

                    <BaseText typographyFont="subSubTitleLight" pt={12}>
                        {LL.MANAGE_CUSTOM_TOKENS_DELETE_DESC()}
                    </BaseText>

                    <BaseSpacer height={16} />
                </BaseView>

                <CustomTokenCard token={tokenToRemove as FungibleToken} />

                <BaseSpacer height={16} />

                <BaseView>
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_REMOVE()}
                        action={onConfirmRemoveToken}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="Light"
                        variant="outline"
                        title={LL.COMMON_BTN_CANCEL()}
                        action={onClose}
                    />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
