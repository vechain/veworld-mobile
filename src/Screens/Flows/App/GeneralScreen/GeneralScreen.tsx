import React, { useCallback } from "react"
import { BaseSpacer, BaseText, BaseView, ChangeLanguage, Layout, SelectLanguageBottomSheet } from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { Locales, useI18nContext } from "~i18n"
import { Reset } from "~Screens/Flows/App/GeneralScreen/Components/Reset"
import { selectLanguage, setLanguage, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { ChangeCurrency, ChangeTheme, SettingsSection } from "./Components"
import { ChangeCurrencyFormat } from "./Components/ChangeCurrencyFormat"
import { ChangeSymbolPosition } from "./Components/ChangeSymbolPosition"

export const GeneralScreen = () => {
    const { LL, setLocale } = useI18nContext()

    const {
        ref: selectLanguageSheetRef,
        onOpen: openSelectLanguageSheet,
        onClose: closeSelectLanguageSheet,
    } = useBottomSheetModal()

    const dispatch = useAppDispatch()

    const selectedLanguageCode = useAppSelector(selectLanguage)

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
                <BaseView pt={8} gap={40}>
                    <SettingsSection icon="icon-settings-2" title={LL.BD_APP_LANGUAGE()}>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" my={8}>
                                {LL.BD_APP_THEME()}
                            </BaseText>
                            <ChangeTheme />
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" my={8}>
                                {LL.BD_APP_LANGUAGE()}
                            </BaseText>
                            <ChangeLanguage language={selectedLanguageCode} onPress={openSelectLanguageSheet} />
                        </SettingsSection.Option>
                    </SettingsSection>

                    <SettingsSection icon="icon-coins" title={LL.BD_APP_LANGUAGE()}>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" my={8}>
                                {LL.BD_CURRENCY_FORMAT()}
                            </BaseText>
                            <ChangeCurrencyFormat />
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" my={8}>
                                {LL.BD_CONVERSION_CURRENCY()}
                            </BaseText>
                            <ChangeCurrency />
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" my={8}>
                                {LL.BD_SYMBOL_POSITION()}
                            </BaseText>
                            <ChangeSymbolPosition />
                        </SettingsSection.Option>
                    </SettingsSection>

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_RESET()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_RESET_DISCLAIMER()}</BaseText>
                    <BaseSpacer height={16} />
                    <Reset />

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
