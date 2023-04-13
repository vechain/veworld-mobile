import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback } from "react"
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
import { LANGUAGE, useBottomSheetModal } from "~Common"
import {
    useAppDispatch,
    useAppSelector,
    selectHideTokensWithNoBalance,
    selectLangauge,
    setHideTokensWithNoBalance,
    setLanguage,
} from "~Storage/Redux"

export const GeneralScreen = () => {
    const nav = useNavigation()

    const theme = useTheme()

    const { LL } = useI18nContext()

    const {
        ref: selectLanguageSheetRef,
        onOpen: openSelectLanguageSheet,
        onClose: closeSelectLanguageSheet,
    } = useBottomSheetModal()

    const dispatch = useAppDispatch()

    const selectedLanguage = useAppSelector(selectLangauge)

    const hideTokensWithNoBalance = useAppSelector(
        selectHideTokensWithNoBalance,
    )
    const goBack = useCallback(() => nav.goBack(), [nav])
    const toggleTokensHiddenSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setHideTokensWithNoBalance(newValue))
        },
        [dispatch],
    )

    const handleSelectLanguage = useCallback(
        (language: string) => {
            dispatch(setLanguage(language as LANGUAGE))

            closeSelectLanguageSheet()
        },
        [closeSelectLanguageSheet, dispatch],
    )

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
                    value={hideTokensWithNoBalance}
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
                    language={selectedLanguage}
                    onPress={openSelectLanguageSheet}
                />

                <SelectLanguageBottomSheet
                    ref={selectLanguageSheetRef}
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
