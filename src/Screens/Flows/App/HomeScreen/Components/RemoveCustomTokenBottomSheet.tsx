import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    CustomTokenCard,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FungibleToken, FungibleTokenWithBalance } from "~Model"

type Props = {
    tokenToRemove?: FungibleTokenWithBalance
    onConfirmRemoveToken: () => void
    onClose: () => void
}

const snapPoints = ["60%"]

export const RemoveCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ tokenToRemove, onConfirmRemoveToken, onClose }, ref) => {
    const { LL } = useI18nContext()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref} noMargins>
            <Layout
                hasSafeArea={false}
                noBackButton
                fixedHeader={
                    <BaseText typographyFont="subTitleBold" mt={22}>
                        {LL.MANAGE_CUSTOM_TOKENS_DELETE_TITLE()}
                    </BaseText>
                }
                body={
                    <BaseView
                        w={100}
                        h={100}
                        flexGrow={1}
                        justifyContent="space-between">
                        <BaseView>
                            <BaseText typographyFont="subSubTitleLight" pt={12}>
                                {LL.MANAGE_CUSTOM_TOKENS_DELETE_DESC()}
                            </BaseText>

                            <BaseSpacer height={16} />
                        </BaseView>

                        <CustomTokenCard
                            token={tokenToRemove as FungibleToken}
                        />
                    </BaseView>
                }
                footer={
                    <BaseView mb={40}>
                        <BaseSpacer height={16} />
                        <BaseButton
                            w={100}
                            haptics="Light"
                            title={LL.COMMON_BTN_REMOVE().toUpperCase()}
                            action={onConfirmRemoveToken}
                        />
                        <BaseSpacer height={16} />
                        <BaseButton
                            w={100}
                            haptics="Light"
                            variant="outline"
                            title={LL.COMMON_BTN_CANCEL().toUpperCase()}
                            action={onClose}
                        />
                    </BaseView>
                }
            />
        </BaseBottomSheet>
    )
})
