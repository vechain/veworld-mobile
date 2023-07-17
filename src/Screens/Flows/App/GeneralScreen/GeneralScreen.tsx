import React, { useCallback } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    BackButtonHeader,
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
import { useBottomSheetModal } from "~Hooks"
import { LANGUAGE } from "~Constants"
import {
    useAppDispatch,
    useAppSelector,
    selectHideTokensWithNoBalance,
    selectLangauge,
    setHideTokensWithNoBalance,
    setLanguage,
} from "~Storage/Redux"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

export const GeneralScreen = () => {
    const { LL } = useI18nContext()

    const tabBarHeight = useBottomTabBarHeight()

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
        <BaseSafeArea grow={1}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[
                    baseStyles.scrollViewContainer,
                    { paddingBottom: tabBarHeight },
                ]}
                style={baseStyles.scrollView}>
                <BackButtonHeader />

                <BaseView mx={20}>
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

                    <BaseSpacer height={20} />
                </BaseView>
            </ScrollView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
})
