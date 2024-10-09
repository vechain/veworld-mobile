import React, { useMemo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { TypedDataDetails } from "~Components/Reusable/TypedDataDetails"
import { useI18nContext } from "~i18n"
import { TypeDataRequest } from "~Model"

type Props = {
    request: TypeDataRequest
}

export const DataMessageDetails: React.FC<Props> = ({ request }) => {
    const { LL } = useI18nContext()

    const typedData = useMemo(() => {
        return { domain: request.domain, types: request.types, value: request.value }
    }, [request])

    return (
        <BaseView>
            <BaseText typographyFont="subTitleBold">{LL.SEND_DETAILS()}</BaseText>

            <BaseSpacer height={16} />
            <TypedDataDetails typedData={typedData} origin={request.origin} />
        </BaseView>
    )
}
