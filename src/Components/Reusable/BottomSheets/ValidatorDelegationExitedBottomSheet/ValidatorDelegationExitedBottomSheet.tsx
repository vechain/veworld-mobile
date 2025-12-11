import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useCallback, useEffect, useMemo } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, STARGATE_DAPP_URL } from "~Constants"
import { components } from "~Generated/indexer/schema"
import { useValidatorExit } from "~Hooks/Staking"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useFetchValidators } from "~Hooks/useFetchValidators"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import { useAppDispatch } from "~Storage/Redux"
import { setLastValidatorExit } from "~Storage/Redux/Actions/WalletPreferences"
import AddressUtils from "~Utils/AddressUtils"
import { getValidatorName } from "~Utils/ValidatorUtils"
import { StargateNodeCard } from "../../StargateNodeCard"

type Props = {}

export const ValidatorDelegationExitedBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>((_, ref) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { navigateWithTab } = useBrowserTab()
    const {
        ref: bottomSheetRef,
        onClose: onBottomSheetClose,
        onOpen: onBottomSheetOpen,
    } = useBottomSheetModal({
        externalRef: ref as RefObject<BottomSheetModalMethods>,
    })
    const { data: validatorExitEvents, isLoading: isValidatorExitEventsLoading } = useValidatorExit()
    const { validators, isLoading: isValidatorsLoading } = useFetchValidators()

    //Get the validator addresses from the validator exit events
    const exitedValidators = useMemo(() => {
        return Object.keys(validatorExitEvents ?? {})
    }, [validatorExitEvents])

    //Get the most recent validator exit event
    const lastValidatorExitEvent = useMemo(() => {
        return Object.values(validatorExitEvents ?? {})
            .flat()
            .sort((a, b) => b.blockTimestamp - a.blockTimestamp)[0]
    }, [validatorExitEvents])

    const validatorName = useMemo(() => {
        if (isValidatorsLoading || !lastValidatorExitEvent?.validator) return ""
        return (
            getValidatorName(validators ?? [], lastValidatorExitEvent.validator) ??
            AddressUtils.humanAddress(lastValidatorExitEvent.validator)
        )
    }, [validators, lastValidatorExitEvent, isValidatorsLoading])

    const getValidatorNames = useCallback(() => {
        return exitedValidators
            .map(validator => {
                return getValidatorName(validators ?? [], validator) ?? AddressUtils.humanAddress(validator)
            })
            .join(", ")
    }, [exitedValidators, validators])

    const onDismiss = useCallback(() => {
        dispatch(setLastValidatorExit())
        onBottomSheetClose()
    }, [dispatch, onBottomSheetClose])

    const onChooseNewValidator = useCallback(() => {
        onDismiss()
        navigateWithTab({
            url: STARGATE_DAPP_URL,
            title: "Stargate",
        })
    }, [onDismiss, navigateWithTab])

    useEffect(() => {
        if (!isValidatorExitEventsLoading && lastValidatorExitEvent) {
            onBottomSheetOpen()
        }
    }, [isValidatorExitEventsLoading, lastValidatorExitEvent, onBottomSheetOpen])

    const description = useMemo(() => {
        if (exitedValidators.length > 1) {
            return LL.VALIDATOR_DELEGATION_EXITED_BOTTOM_SHEET_DESCRIPTION_MULTIPLE({
                validatorNames: getValidatorNames(),
            })
        }
        return LL.VALIDATOR_DELEGATION_EXITED_BOTTOM_SHEET_DESCRIPTION({
            validatorName: validatorName,
        })
    }, [exitedValidators, getValidatorNames, validatorName, LL])

    const buttonTitle = useMemo(() => {
        if (exitedValidators.length > 1) {
            return LL.VALIDATOR_DELEGATION_EXITED_CHOOSE_NEW_VALIDATORS()
        }
        return LL.VALIDATOR_DELEGATION_EXITED_CHOOSE_NEW_VALIDATOR()
    }, [exitedValidators, LL])

    const renderItem = useCallback(({ item }: { item: components["schemas"]["IndexedHistoryEvent"] }) => {
        return <StargateNodeCard tokenId={item.tokenId ?? ""} blockNumber={item.blockNumber} />
    }, [])

    const itemSeparatorComponent = useCallback(() => {
        return <BaseSpacer height={1} background={theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100} />
    }, [theme.isDark])

    return (
        <BaseBottomSheet ref={bottomSheetRef} dynamicHeight scrollable={false} bottomSafeArea>
            <BaseView gap={24}>
                <BaseView justifyContent="center" alignItems="center" gap={24}>
                    <BaseIcon name={"icon-stargate"} size={40} color={theme.colors.text} />
                    <BaseView justifyContent="center" alignItems="center" gap={8}>
                        <BaseText align="center" typographyFont="subSubTitleSemiBold" color={theme.colors.text}>
                            {LL.VALIDATOR_DELEGATION_EXITED_BOTTOM_SHEET_TITLE()}
                        </BaseText>
                        <BaseText align="center" typographyFont="body" lineHeight={20} color={theme.colors.text}>
                            {description}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <FlatList
                    data={Object.values(validatorExitEvents ?? {}).flat()}
                    ItemSeparatorComponent={itemSeparatorComponent}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    style={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                />

                <BaseView gap={16}>
                    <BaseButton action={onChooseNewValidator} title={buttonTitle} />
                    <BaseButton variant="outline" action={onDismiss} title={LL.BTN_ILL_DO_IT_LATER()} />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        contentContainer: {
            maxHeight: 260,
            borderRadius: 12,
            backgroundColor: theme.colors.card,
        },
    })
