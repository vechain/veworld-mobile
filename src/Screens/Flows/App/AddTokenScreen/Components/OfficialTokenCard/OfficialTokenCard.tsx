import { Image, ViewProps } from "react-native"
import React, { memo } from "react"
import { FungibleToken, Token } from "~Model"
import { BaseCard, BaseSpacer, BaseText, BaseTouchableBox } from "~Components"

type Props = {
    token: FungibleToken | Token
    action: () => void
}

export const OfficialTokenCard = memo(
    ({ token, style, action }: Props & ViewProps) => {
        return (
            <BaseTouchableBox
                action={action}
                containerStyle={[{ width: "100%", marginVertical: 7 }, style]}>
                <BaseCard
                    style={{
                        borderRadius: 30,
                        padding: 10,
                    }}>
                    <Image
                        source={{ uri: token.icon }}
                        style={{ width: 20, height: 20 }}
                    />
                </BaseCard>
                <BaseSpacer width={16} />
                <BaseText typographyFont="body">{token.name}</BaseText>
            </BaseTouchableBox>
        )
    },
)
