import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { BalanceUtils } from "~Utils"
import {
    BaseCustomTokenIcon,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Balance } from "~Model"
import { address } from "thor-devkit"

type Props = {
    tokenBalance: Balance
    onTogglePress: (tokenAddress: string) => void
}

export const CustomTokenBox: React.FC<Props> = memo(
    ({ tokenBalance, onTogglePress }) => {
        const theme = useTheme()

        const tokenUnitBalance = useMemo(
            () =>
                BalanceUtils.getTokenUnitBalance(
                    tokenBalance.balance,
                    tokenBalance.tokenDecimals ?? 0,
                ),
            [tokenBalance.balance, tokenBalance.tokenDecimals],
        )

        const shortenedTokenName = useMemo(() => {
            if (!tokenBalance.tokenName) return undefined

            return tokenBalance.tokenName?.length > 27
                ? tokenBalance.tokenName?.substring(0, 26).concat("...")
                : tokenBalance.tokenName
        }, [tokenBalance.tokenName])

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    haptics="Light"
                    action={() => onTogglePress(tokenBalance.tokenAddress)}
                    justifyContent="space-between"
                    containerStyle={baseStyles.container}
                    testID={`${tokenBalance.tokenAddress}-token-box`}>
                    <BaseView flexDirection="row" alignItems="center">
                        <BaseCustomTokenIcon
                            style={baseStyles.icon}
                            tokenSymbol={tokenBalance.tokenSymbol ?? ""}
                            tokenAddress={address.toChecksumed(
                                tokenBalance.tokenAddress ?? "",
                            )}
                        />

                        <BaseSpacer width={8} />

                        <BaseView flexDirection="column">
                            <BaseText typographyFont="button">
                                {shortenedTokenName}
                            </BaseText>
                            <BaseSpacer height={4} />
                            <BaseView flexDirection="row">
                                <BaseText
                                    fontSize={10}
                                    typographyFont="smallCaptionRegular">
                                    {tokenUnitBalance}
                                </BaseText>
                                <BaseText
                                    fontSize={10}
                                    typographyFont="smallCaptionRegular">
                                    {" "}
                                    {tokenBalance.tokenSymbol}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseView style={baseStyles.rightSubContainer}>
                        <BaseIcon
                            color={theme.colors.primary}
                            size={24}
                            name={"plus"}
                            action={() =>
                                onTogglePress(tokenBalance.tokenAddress)
                            }
                        />
                    </BaseView>
                </BaseTouchableBox>
            </BaseView>
        )
    },
)

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rightSubContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    leftSwipeBox: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingLeft: 16,
    },
    icon: {
        width: 38,
        height: 38,
        borderRadius: 38 / 2,
        alignItems: "center",
        justifyContent: "center",
    },
})
