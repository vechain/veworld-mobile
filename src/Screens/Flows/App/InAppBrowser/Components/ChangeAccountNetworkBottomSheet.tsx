import React, { useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    AccountCard,
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    NetworkBox,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, Network } from "~Model"

type Props = {
    targetAccount?: AccountWithDevice
    targetNetwork?: Network
    onConfirm: () => void
    onClose: () => void
}

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

        const body = useMemo(() => {
            if (targetAccount && targetNetwork) {
                return (
                    <BaseView>
                        <BaseText typographyFont="subSubTitleLight" pt={12}>
                            {LL.BROWSER_CHANGE_ACCOUNT_DESC()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <AccountCard account={targetAccount} showOpacityWhenDisabled={false} />
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subSubTitleLight" pt={12}>
                            {LL.BROWSER_CHANGE_NETWORK_DESC()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <NetworkBox network={targetNetwork} />
                    </BaseView>
                )
            }
            if (targetAccount) {
                return (
                    <BaseView>
                        <BaseText typographyFont="subSubTitleLight" pt={12}>
                            {LL.BROWSER_CHANGE_ACCOUNT_DESC()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <AccountCard account={targetAccount} showOpacityWhenDisabled={false} />
                    </BaseView>
                )
            }
            if (targetNetwork) {
                return (
                    <BaseView>
                        <BaseText typographyFont="subSubTitleLight" pt={12}>
                            {LL.BROWSER_CHANGE_NETWORK_DESC()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <NetworkBox network={targetNetwork} />
                    </BaseView>
                )
            }
        }, [LL, targetAccount, targetNetwork])

        const snapPoints = useMemo(() => {
            if (targetAccount && targetNetwork) {
                return ["70%"]
            }
            if (targetAccount) {
                return ["600%"]
            }
            if (targetNetwork) {
                return ["600%"]
            }
        }, [targetAccount, targetNetwork])

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
                    body={body}
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
