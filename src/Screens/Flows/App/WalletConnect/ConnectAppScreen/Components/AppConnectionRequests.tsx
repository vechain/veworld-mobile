import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { RequestMethods } from "~Constants"
import { useI18nContext } from "~i18n"

type Props = {
    name: string
    methods: string[]
}

export const AppConnectionRequests = ({ name, methods }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseView>
            <BaseText typographyFont="subTitle">
                {LL.CONNECTION_REQUEST_TITLE()}
            </BaseText>

            <BaseSpacer height={15} />
            <BaseText>{LL.CONNECTION_REQUEST_SUBTITLE({ name })}</BaseText>

            {methods.find(method => method === "request_transaction") && (
                <>
                    <BaseSpacer height={8} />
                    <BaseText>
                        {LL.CONNECTION_REQUEST_TRANSACTION_DESCRIPTION()}
                    </BaseText>
                </>
            )}
            {methods.find(
                method =>
                    method === RequestMethods.IDENTIFY ||
                    method === RequestMethods.SIGN,
            ) && (
                <>
                    <BaseSpacer height={8} />
                    <BaseText>
                        {LL.CONNECTION_REQUEST_SIGN_DESCRIPTION()}
                    </BaseText>
                </>
            )}
        </BaseView>
    )
}
