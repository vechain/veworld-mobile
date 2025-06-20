import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, useCallback, useMemo } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useSetSelectedAccount, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CertificateRequest } from "~Model"
import {
    selectFeaturedDapps,
    selectSelectedAccount,
    selectVisibleAccountsWithoutObserved,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, DAppUtils } from "~Utils"
import { DappWithDetails } from "../DappWithDetails"

type Request = {
    request: CertificateRequest
    isInjectedWallet?: boolean
}

type Props = {
    request: CertificateRequest
    onCancel: (request: CertificateRequest) => Promise<void>
    onSign: (request: CertificateRequest) => Promise<void>
    onCloseBs: () => void
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
}

const CertificateBottomSheetContent = ({ request, onCancel, onSign, selectAccountBsRef }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const allApps = useAppSelector(selectFeaturedDapps)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const { onClose: onCloseSelectAccountBs, onOpen: onOpenSelectAccountBs } = useBottomSheetModal({
        externalRef: selectAccountBsRef,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { icon, name, url } = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(request.appUrl).origin)
        if (foundDapp)
            return {
                icon: foundDapp.id
                    ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                    : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                name: foundDapp.name,
                url: request.appUrl,
            }

        return {
            name: request.appName,
            url: request.appUrl,
            icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(request.appUrl).origin}`,
        }
    }, [allApps, request.appName, request.appUrl])

    return (
        <>
            <BaseView flexDirection="row" gap={12} justifyContent="space-between">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SIGN_CERTIFICATE_REQUEST_TITLE()}
                    </BaseText>
                </BaseView>
                <AccountSelector account={selectedAccount} onPress={onOpenSelectAccountBs} variant="short" />
            </BaseView>
            <BaseSpacer height={24} />
            <DappWithDetails name={name} icon={icon} url={url} isDefaultVisible>
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="captionRegular">
                    {request.message.payload.content}
                </BaseText>
            </DappWithDetails>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16}>
                <BaseButton action={onCancel.bind(null, request)} variant="outline" flex={1}>
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton
                    action={onSign.bind(null, request)}
                    flex={1}
                    disabled={AccountUtils.isObservedAccount(selectedAccount)}>
                    {LL.SIGN_CERTIFICATE_REQUEST_CTA()}
                </BaseButton>
            </BaseView>

            <SelectAccountBottomSheet
                closeBottomSheet={onCloseSelectAccountBs}
                accounts={visibleAccounts}
                setSelectedAccount={onSetSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBsRef}
            />
        </>
    )
}

export const CertificateBottomSheet = () => {
    const { certificateBsRef } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: certificateBsRef })

    const { ref: selectAccountBsRef } = useBottomSheetModal()

    const onSign = useCallback(async () => {}, [])
    const onCancel = useCallback(async () => {}, [])

    return (
        <BaseBottomSheet<Request> dynamicHeight ref={certificateBsRef}>
            {data => (
                <CertificateBottomSheetContent
                    onCancel={onCancel}
                    onSign={onSign}
                    onCloseBs={onCloseBs}
                    request={data.request}
                    selectAccountBsRef={selectAccountBsRef}
                />
            )}
        </BaseBottomSheet>
    )
}
