import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { BaseSafeArea, BaseText, BaseView } from "~Components"
import { TokenWithCompleteInfo } from "~Model"
import { RootStackParamListDiscover, Routes } from "~Navigation"

type Props = {} & NativeStackScreenProps<
    RootStackParamListDiscover,
    Routes.TOKEN_DETAILS
>

export const AssetDetailScreen = ({ route }: Props) => {
    const [token] = useState<TokenWithCompleteInfo | undefined>(
        route.params.token,
    )

    return (
        <BaseSafeArea grow={1}>
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="largeTitle">
                    {token?.name ?? "Token"}
                </BaseText>
            </BaseView>
        </BaseSafeArea>
    )
}
