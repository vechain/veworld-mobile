import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import moment from "moment"
import React, { RefObject, useCallback, useEffect } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { STARGATE_DAPP_URL } from "~Constants"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useTheme } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    setLastValidatorExited,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type Props = {}

export const ValidatorDelegationExitedBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({}, ref) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { navigateWithTab } = useBrowserTab()
    const {
        ref: bottomSheetRef,
        onClose: onBottomSheetClose,
        onOpen: onBottomSheetOpen,
    } = useBottomSheetModal({
        externalRef: ref as RefObject<BottomSheetModalMethods>,
    })

    const currentNetwork = useAppSelector(selectSelectedNetwork)
    const currentAccount = useAppSelector(selectSelectedAccount)

    const onDismiss = useCallback(() => {
        const timestamp = moment().unix()
        dispatch(
            setLastValidatorExited({
                genesisId: currentNetwork.id,
                address: currentAccount.address,
                timestamp,
                validatorId: "0x0000000000000000000000000000000000000000",
            }),
        )
        onBottomSheetClose()
    }, [dispatch, currentNetwork.id, currentAccount.address, onBottomSheetClose])

    const onChooseNewValidator = useCallback(() => {
        onDismiss()
        navigateWithTab({
            url: STARGATE_DAPP_URL,
            title: "Stargate",
        })
    }, [onDismiss, navigateWithTab])

    useEffect(() => {
        onBottomSheetOpen()
    }, [onBottomSheetOpen])

    return (
        <BaseBottomSheet ref={bottomSheetRef} dynamicHeight onDismiss={onDismiss} scrollable={false} bottomSafeArea>
            <BaseView gap={24}>
                <BaseView justifyContent="center" alignItems="center" gap={24}>
                    <BaseIcon name={"icon-stargate"} size={40} color={theme.colors.text} />
                    <BaseView justifyContent="center" alignItems="center" gap={8}>
                        <BaseText align="center" typographyFont="subSubTitleSemiBold" color={theme.colors.text}>
                            {"StarGate notification"}
                        </BaseText>
                        <BaseText align="center" typographyFont="body" lineHeight={20} color={theme.colors.text}>
                            {
                                // eslint-disable-next-line max-len
                                "The validator {validatorName} is no longer active. A new validator must be selected to continue earning rewards."
                            }
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseSpacer height={256} />
                <BaseView gap={16}>
                    <BaseButton action={onChooseNewValidator} title="Choose new validator" />
                    <BaseButton variant="outline" action={onDismiss} title={LL.BTN_ILL_DO_IT_LATER()} />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
