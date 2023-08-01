import React, { useMemo } from "react"
import { useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { VTHO } from "~Constants"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import {
    selectVthoTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { EstimateGasResult } from "~Model"
import { BigNumber } from "bignumber.js"
import { DelegationType } from "~Model/Delegation"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

export const useRenderGas = ({
    loadingGas,
    selectedDelegationOption,
    gas,
    tokenSymbol,
    amount,
    accountAddress,
}: {
    loadingGas: boolean
    selectedDelegationOption: DelegationType
    gas: EstimateGasResult | undefined
    tokenSymbol?: string
    amount?: string
    accountAddress: string
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(state, accountAddress),
    )

    const vthoGas = FormattingUtils.convertToFiatBalance(
        gas?.gas?.toString() || "0",
        1,
        5,
    )

    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )

    const isThereEnoughGas = useMemo(() => {
        let leftVtho = new BigNumber(vthoBalance)
        if (tokenSymbol === VTHO.symbol && amount) {
            leftVtho = leftVtho.minus(amount)
        }
        return vthoGas && leftVtho.gte(vthoGas)
    }, [amount, vthoGas, tokenSymbol, vthoBalance])

    const RenderGas = () => {
        if (loadingGas) {
            return (
                <SkeletonContent
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    layout={[
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                {
                                    width: "40%",
                                    height: 18,
                                },
                            ],
                        },
                    ]}
                    isLoading={true}
                />
            )
        }

        if (selectedDelegationOption === DelegationType.URL) {
            return (
                <BaseText typographyFont="subSubTitle">
                    {LL.SEND_DELEGATED_FEES()}
                </BaseText>
            )
        } else {
            return (
                <>
                    <BaseText typographyFont="subSubTitle">
                        {vthoGas || LL.COMMON_NOT_AVAILABLE()} {VTHO.symbol}
                    </BaseText>
                    {!isThereEnoughGas && (
                        <>
                            <BaseSpacer height={8} />
                            <BaseView flexDirection="row">
                                <BaseIcon
                                    name="alert-circle-outline"
                                    color={theme.colors.danger}
                                    size={16}
                                />
                                <BaseSpacer width={4} />
                                <BaseText
                                    typographyFont="buttonSecondary"
                                    color={theme.colors.danger}>
                                    {LL.SEND_INSUFFICIENT_VTHO()} {vthoBalance}{" "}
                                    {VTHO.symbol}
                                </BaseText>
                            </BaseView>
                        </>
                    )}
                </>
            )
        }
    }

    return { RenderGas, isThereEnoughGas, vthoGas, vthoBalance }
}
