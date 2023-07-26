import React, { useCallback } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    EnableFeature,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    ChangeCurrency,
    ChangeLanguage,
    ChangeTheme,
    SelectLanguageBottomSheet,
} from "./Components"
import { useBottomSheetModal } from "~Hooks"
import { isSmallScreen, LANGUAGE } from "~Constants"
import {
    selectHideTokensWithNoBalance,
    selectLangauge,
    setHideTokensWithNoBalance,
    setLanguage,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { DEV_FEATURES } from "../../../../../index"

export const GeneralScreen = () => {
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
        <Layout
            safeAreaTestID="General_Screen"
            isScrollEnabled={isSmallScreen}
            body={
                <BaseView pt={16}>
                    <BaseText typographyFont="title">
                        {LL.TITLE_GENERAL()}
                    </BaseText>
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

                    {DEV_FEATURES && (
                        <>
                            <EnableFeature
                                title={LL.BD_HIDE_TOKENS()}
                                subtitle={LL.BD_HIDE_TOKENS_DISCLAIMER()}
                                onValueChange={toggleTokensHiddenSwitch}
                                value={hideTokensWithNoBalance}
                            />

                            <BaseSpacer height={20} />
                        </>
                    )}

                    {DEV_FEATURES && (
                        <>
                            <BaseText typographyFont="bodyMedium" my={8}>
                                {LL.BD_APP_LANGUAGE()}
                            </BaseText>
                            <BaseText typographyFont="caption">
                                {LL.BD_APP_LANGUAGE_DISCLAIMER()}
                            </BaseText>

                            <BaseSpacer height={20} />
                        </>
                    )}

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

                    <BaseSpacer height={20} />
                </BaseView>
            }
        />
    )
}
