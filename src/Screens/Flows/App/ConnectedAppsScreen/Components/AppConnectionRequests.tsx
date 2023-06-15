import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { RequestMethods } from "~Constants"

type Props = {
    name: string
    methods: string[]
}

export const AppConnectionRequests = ({ name, methods }: Props) => {
    return (
        <BaseView>
            <BaseText typographyFont="subTitle">
                {"Connection request"}
            </BaseText>

            <BaseSpacer height={15} />
            <BaseText>{name + " is asking for access to:"}</BaseText>

            {methods.find(method => method === "request_transaction") && (
                <>
                    <BaseSpacer height={8} />
                    <BaseText>
                        {"\u25CF Request transactions to send to Vechain Thor"}
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
                        {
                            "\u25CF Request your signature on certificates or identification and agreements"
                        }
                    </BaseText>
                </>
            )}
        </BaseView>
    )
}
