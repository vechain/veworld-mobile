import { default as React, useCallback, useMemo } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CertificateRequest } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { DappWithDetails } from "../DappWithDetails"

type Props = {
    request: CertificateRequest
    onCancel: (request: CertificateRequest) => Promise<void>
    onSign: (request: CertificateRequest) => Promise<void>
    onCloseBs: () => void
}
const CertificateBottomSheetContent = ({ request, onCancel, onSign }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const allApps = useAppSelector(selectFeaturedDapps)
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
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {LL.SIGN_CERTIFICATE_REQUEST_TITLE()}
                </BaseText>
            </BaseView>
            <DappWithDetails name={name} icon={icon} url={url} />
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16}>
                <BaseButton action={onCancel.bind(null, request)} variant="outline" flex={1}>
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton action={onSign.bind(null, request)} flex={1}>
                    {LL.COMMON_BTN_APPLY()}
                </BaseButton>
            </BaseView>
        </>
    )
}

export const CertificateBottomSheet = () => {
    const { connectBsRef } = useInteraction()
    const { ref, onClose: onCloseBs } = useBottomSheetModal({ externalRef: connectBsRef })

    const onSign = useCallback(async () => {}, [])
    const onCancel = useCallback(async () => {}, [])

    return (
        <BaseBottomSheet<CertificateRequest> dynamicHeight ref={ref}>
            {data => (
                <CertificateBottomSheetContent
                    onCancel={onCancel}
                    onSign={onSign}
                    onCloseBs={onCloseBs}
                    request={data}
                />
            )}
        </BaseBottomSheet>
    )
}
