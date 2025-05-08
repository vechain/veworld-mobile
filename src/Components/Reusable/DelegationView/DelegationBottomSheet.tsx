import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { forwardRef, default as React, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButtonGroupHorizontal, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useScrollableBottomSheet, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, BaseButtonGroupHorizontalType, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { selectDelegationAccountsWithVtho, selectDelegationUrls, useAppSelector } from "~Storage/Redux"
import { RenderedOption } from "./Components/RenderedOption"

type Props = {
    setNoDelegation: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationAccount: (account: AccountWithDevice) => void
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (url: string) => void
    onCloseBottomSheet: () => void
}
export const DelegationBottomSheet = forwardRef<BottomSheetModalMethods, Props>(function DelegationBottomSheet(
    {
        setNoDelegation,
        selectedDelegationOption,
        setSelectedDelegationAccount,
        selectedDelegationAccount,
        selectedDelegationUrl,
        setSelectedDelegationUrl,
        onCloseBottomSheet,
    },
    ref,
) {
    const { LL } = useI18nContext()

    const accounts = useAppSelector(selectDelegationAccountsWithVtho)
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const [selectedOption, setSelectedOption] = useState(selectedDelegationOption)
    const { theme, styles } = useThemedStyles(baseStyles)

    const options: Array<BaseButtonGroupHorizontalType> = useMemo(() => {
        return [
            {
                id: DelegationType.NONE,
                label: LL.SEND_DELEGATION_NONE(),
            },
            {
                id: DelegationType.ACCOUNT,
                label: LL.SEND_DELEGATION_ACCOUNT(),
                disabled: accounts.length === 0,
            },
            {
                id: DelegationType.URL,
                label: LL.SEND_DELEGATION_URL(),
            },
        ]
    }, [LL, accounts.length])

    // this function is called when a delegation option is selected
    const handleSelectDelegationOption = useCallback((button: BaseButtonGroupHorizontalType) => {
        setSelectedOption(button.id as DelegationType)
    }, [])

    const computeSnappoints = useMemo(() => {
        if (selectedOption === DelegationType.NONE) return ["50%", "75%", "90%"]
        if (selectedOption === DelegationType.ACCOUNT) {
            if (accounts.length === 1) return ["63%"]
            if (accounts.length === 2) return ["70%"]
            if (accounts.length === 3) return ["80%"]
            return ["85%"]
        }

        return ["90%"]
    }, [accounts.length, selectedOption])

    const { flatListScrollProps, handleSheetChangePosition } = useScrollableBottomSheet({
        data: selectedOption === DelegationType.ACCOUNT ? accounts : [],
        snapPoints: computeSnappoints,
    })

    const hasDynamicHeight = useMemo(() => {
        switch (selectedOption) {
            case DelegationType.NONE:
                return true
            case DelegationType.ACCOUNT:
                return false
            case DelegationType.URL:
                return true
        }
    }, [selectedOption])

    return (
        <BaseBottomSheet
            style={styles.root}
            dynamicHeight={hasDynamicHeight}
            ref={ref}
            snapPoints={hasDynamicHeight ? undefined : computeSnappoints}
            onChange={hasDynamicHeight ? undefined : handleSheetChangePosition}>
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon name="icon-arrow-link" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {LL.DELEGATE_FEE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={8} />
            <BaseText typographyFont="buttonSecondary" color={theme.colors.editSpeedBs.subtitle}>
                {LL.DELEGATE_DESCRIPTION()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseButtonGroupHorizontal
                selectedButtonIds={[selectedOption]}
                buttons={options}
                action={handleSelectDelegationOption}
                renderButton={(button, textColor) => (
                    <BaseView justifyContent="center" alignItems="center" flexDirection="row">
                        <BaseText color={textColor} typographyFont="smallButtonPrimary">
                            {button.label}
                        </BaseText>
                    </BaseView>
                )}
            />
            <BaseSpacer height={24} />
            <RenderedOption
                flatListScrollProps={flatListScrollProps}
                onReset={() => {
                    setSelectedOption(selectedDelegationOption)
                }}
                selectedOption={selectedOption}
                setNoDelegation={setNoDelegation}
                setSelectedDelegationAccount={setSelectedDelegationAccount}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                selectedDelegationAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
                onClose={onCloseBottomSheet}
                accounts={accounts}
                delegationUrls={delegationUrls}
            />
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.colors.editSpeedBs.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
    })
