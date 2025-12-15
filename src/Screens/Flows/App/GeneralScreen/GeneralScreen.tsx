import React from "react"
import { BaseSpacer, BaseText, BaseView, ChangeLanguage, Layout, SelectLanguageBottomSheet } from "~Components"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectLanguage, useAppSelector } from "~Storage/Redux"
import { ChangeCurrency, ChangeTheme, ResetAppBox, SettingsSection } from "./Components"
import { ChangeCurrencyFormat } from "./Components/ChangeCurrencyFormat"
import { ChangeSymbolPosition } from "./Components/ChangeSymbolPosition"

export const GeneralScreen = () => {
    const selectedLanguageCode = useAppSelector(selectLanguage)

    const theme = useTheme()
    const { LL } = useI18nContext()
    const { ref: selectLanguageSheetRef, onOpen: openSelectLanguageSheet } = useBottomSheetModal()

    return (
        <Layout
            safeAreaTestID="General_Screen"
            title={LL.TITLE_GENERAL_SETTINGS()}
            body={
                <BaseView pt={8} gap={8}>
                    <SettingsSection icon="icon-settings-2" title={LL.SETTINGS_SECTION_APP_PREFERENCES()}>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.BD_APP_THEME()}
                            </BaseText>
                            <ChangeTheme />
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.BD_APP_LANGUAGE()}
                            </BaseText>
                            <ChangeLanguage language={selectedLanguageCode} onPress={openSelectLanguageSheet} />
                        </SettingsSection.Option>
                    </SettingsSection>

                    <SettingsSection icon="icon-coins" title={LL.SETTINGS_SECTION_CURRENCY_PREFERENCES()}>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.BD_CURRENCY_FORMAT()}
                            </BaseText>
                            <ChangeCurrencyFormat />
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.BD_CONVERSION_CURRENCY()}
                            </BaseText>
                            <ChangeCurrency />
                        </SettingsSection.Option>
                        <SettingsSection.Option>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.settingsSection.optionTitle}>
                                {LL.BD_SYMBOL_POSITION()}
                            </BaseText>
                            <ChangeSymbolPosition />
                        </SettingsSection.Option>
                    </SettingsSection>

                    <ResetAppBox />

                    <SelectLanguageBottomSheet bsRef={selectLanguageSheetRef} />
                    <BaseSpacer height={20} />
                </BaseView>
            }
        />
    )
}
