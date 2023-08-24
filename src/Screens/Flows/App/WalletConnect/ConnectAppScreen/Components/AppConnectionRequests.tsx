import React, { useMemo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { RequestMethods } from "~Constants"
import { useI18nContext } from "~i18n"

type Props = {
    name: string
    methods: string[]
}

export const AppConnectionRequests = ({ name, methods }: Props) => {
    const { LL } = useI18nContext()

    const renderRequestTransactionDescription = useMemo(() => {
        if (
            methods.find(
                method => method === RequestMethods.REQUEST_TRANSACTION,
            )
        ) {
            return (
                <>
                    <BaseSpacer height={8} />
                    <BaseText>
                        {LL.CONNECTION_REQUEST_TRANSACTION_DESCRIPTION()}
                    </BaseText>
                </>
            )
        }
    }, [methods, LL])

    const renderRequestSignDescription = useMemo(() => {
        if (
            methods.find(
                method =>
                    method === RequestMethods.SIGN_CERTIFICATE ||
                    method === RequestMethods.REQUEST_TRANSACTION,
            )
        ) {
            return (
                <>
                    <BaseSpacer height={8} />
                    <BaseText>
                        {LL.CONNECTION_REQUEST_SIGN_DESCRIPTION()}
                    </BaseText>
                </>
            )
        }
    }, [methods, LL])

    return (
        <BaseView>
            <BaseText typographyFont="subTitle">
                {LL.CONNECTION_REQUEST_TITLE()}
            </BaseText>

            <BaseSpacer height={15} />
            <BaseText>{LL.CONNECTION_REQUEST_SUBTITLE({ name })}</BaseText>

            {renderRequestTransactionDescription}
            {renderRequestSignDescription}
        </BaseView>
    )
}
