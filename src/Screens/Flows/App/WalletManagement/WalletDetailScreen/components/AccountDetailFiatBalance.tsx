import React, { useMemo } from "react"
import { BaseSkeleton, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks/useTheme"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { WalletAccount } from "~Model"

type Props = {
    account: WalletAccount
    isVisible: boolean
}

export const AccountDetailFiatBalance: React.FC<Props> = ({ account, isVisible }) => {
    const theme = useTheme()

    const { renderedBalance: renderedFiatBalance, isLoading } = useTotalFiatBalance({
        address: account.address,
    })

    const balance = useMemo(() => {
        if (!isVisible) {
            return "••••"
        }

        return renderedFiatBalance
    }, [isVisible, renderedFiatBalance])

    return (
        <BaseView flexDirection="row">
            {isLoading ? (
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    width={40}
                    height={14}
                />
            ) : (
                <BaseText
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                    typographyFont="caption"
                    align="right">
                    {balance}
                </BaseText>
            )}
        </BaseView>
    )
}
