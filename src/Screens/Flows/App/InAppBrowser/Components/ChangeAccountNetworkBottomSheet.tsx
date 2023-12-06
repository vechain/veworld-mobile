import React, { useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    targetAccount?: string
    targetNetwork?: string
    onConfirm: () => void
    onClose: () => void
}

const snapPoints = ["60%"]

export const ChangeAccountNetworkBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onConfirm, onClose, targetAccount, targetNetwork }, ref) => {
        const { LL } = useI18nContext()

        const title = useMemo(() => {
            if (targetAccount && targetNetwork) {
                return LL.BROWSER_CHANGE_ACCOUNT_NETWORK_TITLE()
            }
            if (targetAccount) {
                return LL.BROWSER_CHANGE_ACCOUNT_TITLE()
            }
            if (targetNetwork) {
                return LL.BROWSER_CHANGE_NETWORK_TITLE()
            }
        }, [LL, targetAccount, targetNetwork])

        const description = useMemo(() => {
            if (targetAccount && targetNetwork) {
                return LL.BROWSER_CHANGE_ACCOUNT_NETWORK_DESC({
                    network: targetNetwork.toUpperCase(),
                    account: targetAccount.toUpperCase(),
                })
            }
            if (targetAccount) {
                return LL.BROWSER_CHANGE_ACCOUNT_DESC({
                    account: targetAccount.toUpperCase(),
                })
            }
            if (targetNetwork) {
                return LL.BROWSER_CHANGE_NETWORK_DESC({
                    network: targetNetwork.toUpperCase(),
                })
            }
        }, [LL, targetAccount, targetNetwork])

        return (
            <BaseBottomSheet snapPoints={snapPoints} ref={ref} noMargins>
                <Layout
                    hasSafeArea={false}
                    noBackButton
                    fixedHeader={
                        <BaseText typographyFont="subTitleBold" mt={22}>
                            {title}
                        </BaseText>
                    }
                    body={
                        <BaseView>
                            <BaseText typographyFont="subSubTitleLight" pt={12}>
                                {description}
                            </BaseText>
                        </BaseView>
                    }
                    footer={
                        <BaseView mb={40}>
                            <BaseSpacer height={16} />
                            <BaseButton
                                w={100}
                                haptics="Light"
                                title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                                action={onConfirm}
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
    },
)
