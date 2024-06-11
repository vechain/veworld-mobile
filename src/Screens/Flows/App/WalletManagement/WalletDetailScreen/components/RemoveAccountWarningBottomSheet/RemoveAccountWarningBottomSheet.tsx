import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import { AccountWithDevice } from "~Model"
import { AccountDetailBox } from "../../AccountDetailBox"

type Props = {
    onConfirm: () => void
    onCancel: () => void
    accountToRemove?: AccountWithDevice
    isBalanceVisible: boolean
}

export const RemoveAccountWarningBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onConfirm, onCancel, accountToRemove, isBalanceVisible }, ref) => {
        const { LL } = useI18nContext()

        const handleOnProceed = useCallback(() => {
            onConfirm()
        }, [onConfirm])

        return (
            <BaseBottomSheet ref={ref} dynamicHeight>
                <BaseView>
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">{LL.BTN_REMOVE_ACCOUNT()}</BaseText>
                        <BaseSpacer height={16} />
                        {accountToRemove && (
                            <AccountDetailBox
                                isBalanceVisible={isBalanceVisible}
                                account={accountToRemove}
                                isSelected={false}
                                isDisabled={false}
                                isEditable={false}
                            />
                        )}
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleLight">{LL.BD_ACCOUNT_REMOVAL()}</BaseText>

                        {PlatformUtils.isAndroid() && (
                            <BaseText typographyFont="subSubTitle" pt={4}>
                                {LL.SB_UPGRADE_SECURITY_WARNING_ANDROID()}
                            </BaseText>
                        )}
                    </BaseView>

                    <BaseView>
                        <BaseSpacer height={16} />

                        <BaseButton
                            w={100}
                            haptics="Light"
                            title={LL.BTN_REMOVE_ACCOUNT().toUpperCase()}
                            action={handleOnProceed}
                        />
                        <BaseSpacer height={16} />
                        <BaseButton
                            w={100}
                            haptics="Light"
                            variant="outline"
                            title={LL.COMMON_BTN_CANCEL().toUpperCase()}
                            action={onCancel}
                        />
                    </BaseView>
                    <BaseSpacer height={16} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
