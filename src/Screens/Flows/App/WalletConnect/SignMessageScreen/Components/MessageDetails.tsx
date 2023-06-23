import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import React from "react"
import { capitalize } from "lodash"
import { WalletConnectUtils } from "~Utils"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { useTheme } from "~Hooks"

type Props = {
    sessionRequest: SessionTypes.Struct
    requestEvent: SignClientTypes.EventArguments["session_request"]
}

export const MessageDetails = ({ sessionRequest, requestEvent }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    // Session request values
    const { method, params } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const { name } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)
    const message = params.payload.content

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
            <BaseText typographyFont="subSubTitle">{name}</BaseText>

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
                {capitalize(method)}
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
            <BaseText
                typographyFont="subSubTitle"
                numberOfLines={2}
                ellipsizeMode="tail">
                {message}
            </BaseText>
        </BaseView>
    )
}
