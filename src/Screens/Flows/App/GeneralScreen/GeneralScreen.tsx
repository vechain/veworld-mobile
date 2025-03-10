import React, { useCallback } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    ChangeLanguage,
    EnableFeature,
    Layout,
    SelectLanguageBottomSheet,
} from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { Locales, useI18nContext } from "~i18n"
import { Reset } from "~Screens/Flows/App/GeneralScreen/Components/Reset"
import {
    selectAreDevFeaturesEnabled,
    selectHideTokensWithNoBalance,
    selectLanguage,
    selectSentryTrackingEnabled,
    setHideTokensWithNoBalance,
    setLanguage,
    setSentryTrackingEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { ChangeCurrency, ChangeTheme } from "./Components"
import { ChangeSymbolPosition } from "./Components/ChangeSymbolPosition"
import { ChangeCurrencyFormat } from "./Components/ChangeCurrencyFormat"

export const GeneralScreen = () => {
    const { LL, setLocale } = useI18nContext()

    const {
        ref: selectLanguageSheetRef,
        onOpen: openSelectLanguageSheet,
        onClose: closeSelectLanguageSheet,
    } = useBottomSheetModal()

    const dispatch = useAppDispatch()

    const selectedLanguageCode = useAppSelector(selectLanguage)
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const sentryTrackingEnabled = useAppSelector(selectSentryTrackingEnabled)

    const toggleSentryTrackingSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setSentryTrackingEnabled(newValue))
        },
        [dispatch],
    )

    const hideTokensWithNoBalance = useAppSelector(selectHideTokensWithNoBalance)

    const toggleTokensHiddenSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setHideTokensWithNoBalance(newValue))
        },
        [dispatch],
    )

    const handleSelectLanguage = useCallback(
        (language: Locales) => {
            dispatch(setLanguage(language))
            setLocale(language)
            closeSelectLanguageSheet()
        },
        [closeSelectLanguageSheet, dispatch, setLocale],
    )

    return (
        <Layout
            safeAreaTestID="General_Screen"
            title={LL.TITLE_GENERAL_SETTINGS()}
            body={
                <BaseView pt={8}>
                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_CONVERSION_CURRENCY()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_CONVERSION_CURRENCY_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={20} />
                    <ChangeCurrency />
                    <BaseSpacer height={20} />

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_CURRENCY_FORMAT()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_CURRENCY_FORMAT_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={20} />
                    <ChangeCurrencyFormat />

                    <BaseSpacer height={20} />

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_SYMBOL_POSITION()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_SYMBOL_POSITION_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={20} />
                    <ChangeSymbolPosition />
                    <BaseSpacer height={20} />

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_APP_THEME()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_APP_THEME_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={20} />
                    <ChangeTheme />
                    <BaseSpacer height={20} />

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_APP_LANGUAGE()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_APP_LANGUAGE_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={20} />
                    <ChangeLanguage language={selectedLanguageCode} onPress={openSelectLanguageSheet} />

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_RESET()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_RESET_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={16} />
                    <Reset />

                    {devFeaturesEnabled && (
                        <>
                            <BaseSpacer height={24} />
                            <EnableFeature
                                title={LL.BD_HELP_IMPROVE()}
                                subtitle={LL.BD_HELP_IMPROVE_DISCLAIMER()}
                                onValueChange={toggleSentryTrackingSwitch}
                                value={sentryTrackingEnabled}
                            />
                        </>
                    )}

                    {devFeaturesEnabled && (
                        <>
                            <BaseSpacer height={20} />
                            <EnableFeature
                                title={LL.BD_HIDE_TOKENS()}
                                subtitle={LL.BD_HIDE_TOKENS_DISCLAIMER()}
                                onValueChange={toggleTokensHiddenSwitch}
                                value={hideTokensWithNoBalance}
                            />
                        </>
                    )}

                    <BaseSpacer height={20} />

                    <SelectLanguageBottomSheet
                        ref={selectLanguageSheetRef}
                        selectedLanguage={selectedLanguageCode}
                        handleSelectLanguage={handleSelectLanguage}
                    />
                    <BaseSpacer height={20} />
                </BaseView>
            }
        />
    )
}
