import React, { memo, useCallback } from "react"
import { TokenWithCompleteInfo, useTokenWithCompleteInfo } from "~Hooks"
import { VechainTokenCard } from "./VechainTokenCard"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { B3TR, VOT3 } from "~Constants"
import { VeB3trTokenCard } from "./VeB3trTokenCard"
import { TokenContainer } from "./TokenContainer"

export type NativeTokenProps = {
    tokenWithInfo: TokenWithCompleteInfo
    isEdit: boolean
    isBalanceVisible: boolean
}

export const AnimatedChartCard = memo(({ tokenWithInfo, isEdit, isBalanceVisible }: NativeTokenProps) => {
    const nav = useNavigation()
    const isB3tr = tokenWithInfo.symbol === B3TR.symbol
    const vot3TokenInfo = useTokenWithCompleteInfo(VOT3)

    const onVechainTokenPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        if (!isEdit) nav.navigate(Routes.TOKEN_DETAILS, { token: tokenWithInfo })
    }, [isEdit, nav, tokenWithInfo])

    return (
        <TokenContainer isEdit={isEdit} onPress={onVechainTokenPress}>
            {isB3tr ? (
                <VeB3trTokenCard
                    isBalanceVisible={isBalanceVisible}
                    b3trToken={tokenWithInfo}
                    vot3Token={vot3TokenInfo}
                    isAnimation={isEdit}
                />
            ) : (
                <VechainTokenCard
                    isBalanceVisible={isBalanceVisible}
                    tokenWithInfo={tokenWithInfo}
                    isAnimation={isEdit}
                />
            )}
        </TokenContainer>
    )
})
