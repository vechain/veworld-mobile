import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    EnableFeature,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    ChangeTheme,
    ChangeCurrency,
    ChangeLanguage,
    SelectLanguageBottomSheet,
} from "./Components"
import { useBottomSheetModal } from "~Common"
import { getUserPreferences, useRealm } from "~Storage"

export const GeneralScreen = () => {
    const nav = useNavigation()

    const theme = useTheme()

    const { LL } = useI18nContext()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const { store } = useRealm()

    const userPref = getUserPreferences(store)

    const languagePref = useMemo(() => userPref?.language, [userPref])

    // Checks if the user wants to hide tokens with small balances
    // TODO realm user preference to save the choice, update TokenList tokens for small balances & update the switch with the saved preference
    const [isTokensHidden, setIsTokensHidden] = useState(false)

    // Toggles the switch to hide tokens with small balances
    const toggleTokensHiddenSwitch = useCallback((newValue: boolean) => {
        setIsTokensHidden(newValue)
    }, [])

    const {
        ref: walletManagementBottomSheetRef,
        onOpen: openSelectLanguageSheet,
        onClose: closeSelectLanguageSheet,
    } = useBottomSheetModal()

    const [selectedLanguage, setSelectedLanguage] =
        useState<string>(languagePref)

    const handleSelectLanguage = useCallback(
        (language: string) => {
            setSelectedLanguage(language)

            store.write(() => {
                if (userPref) {
                    userPref.language = language
                }
            })

            // Closes the bottom sheet
            closeSelectLanguageSheet()
        },
        [closeSelectLanguageSheet, store, userPref],
    )

    // Opens the bottom sheet to select the language
    const onSelectLanguageClick = useCallback(() => {
        openSelectLanguageSheet()
    }, [openSelectLanguageSheet])

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={12} />
            <BaseView mx={20}>
                <BaseText typographyFont="title">{LL.TITLE_GENERAL()}</BaseText>
                <BaseSpacer height={20} />

                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_CONVERSION_CURRENCY()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_CONVERSION_CURRENCY_DISCLAIMER()}
                </BaseText>

                <BaseSpacer height={20} />

                <ChangeCurrency />

                <BaseSpacer height={20} />

                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_APP_THEME()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_APP_THEME_DISCLAIMER()}
                </BaseText>

                <BaseSpacer height={20} />

                <ChangeTheme />

                <BaseSpacer height={20} />

                <EnableFeature
                    title={LL.BD_HIDE_TOKENS()}
                    subtitle={LL.BD_HIDE_TOKENS_DISCLAIMER()}
                    onValueChange={toggleTokensHiddenSwitch}
                    value={isTokensHidden}
                />

                <BaseSpacer height={20} />

                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_APP_LANGUAGE()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_APP_LANGUAGE_DISCLAIMER()}
                </BaseText>

                <BaseSpacer height={20} />

                <ChangeLanguage
                    placeholder={selectedLanguage}
                    onPress={onSelectLanguageClick}
                />

                <SelectLanguageBottomSheet
                    ref={walletManagementBottomSheetRef}
                    onClose={closeSelectLanguageSheet}
                    selectedLanguage={selectedLanguage}
                    handleSelectLanguage={handleSelectLanguage}
                />
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
})
