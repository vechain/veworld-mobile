import {
    BaseSpacer,
    BaseText,
    BaseView,
    CompressAndExpandBaseText,
} from "~Components"
import { useI18nContext } from "~i18n"
import React from "react"
import { capitalize } from "lodash"
import { useTheme } from "~Hooks"
import { CertificateRequest } from "~Model"

type Props = {
    request: CertificateRequest
}

export const MessageDetails = ({ request }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <BaseView>
            <BaseText typographyFont="subTitleBold">
                {LL.SEND_DETAILS()}
            </BaseText>

            <BaseSpacer height={24} />
            <BaseText typographyFont="buttonSecondary">
                {LL.CONNECTED_APP_SELECTED_ORIGIN_LABEL()}
            </BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">{request.appName}</BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer
                height={0.5}
                width={"100%"}
                background={theme.colors.textDisabled}
            />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">
                {LL.CONNECTED_APP_SELECTED_PURPOSE_LABEL()}
            </BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">
                {capitalize(request.message.purpose)}
            </BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer
                height={0.5}
                width={"100%"}
                background={theme.colors.textDisabled}
            />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">
                {LL.CONNECTED_APP_SELECTED_CONTENT_LABEL()}
            </BaseText>
            <BaseSpacer height={6} />
            <CompressAndExpandBaseText
                text={request.message.payload.content}
                typographyFont="subSubTitle"
            />
        </BaseView>
    )
}
