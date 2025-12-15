import React, { RefObject, useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView, BaseBottomSheet, BaseIcon } from "~Components/Base"
import { Locales, useI18nContext } from "~i18n"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useThemedStyles } from "~Hooks/useTheme"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { languages } from "~Model"
import { COLORS, ColorThemeType } from "~Constants"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { selectLanguage, setLanguage, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { LinearTransition } from "react-native-reanimated"

type Props = { bsRef: RefObject<BottomSheetModalMethods> }

export const SelectLanguageBottomSheet = ({ bsRef }: Props) => {
    const selectedLanguage = useAppSelector(selectLanguage)

    const dispatch = useAppDispatch()
    const { LL, setLocale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { ref, onClose } = useBottomSheetModal({ externalRef: bsRef })

    const handleSelectLanguage = useCallback(
        (language: Locales) => {
            dispatch(setLanguage(language))
            setLocale(language)
            onClose()
        },
        [onClose, setLocale, dispatch],
    )

    const languagesListSeparator = useCallback(() => <BaseSpacer height={8} />, [])

    return (
        <BaseBottomSheet
            dynamicHeight
            ref={ref}
            enableContentPanningGesture={false}
            scrollable={false}
            backgroundStyle={styles.background}>
            <NestableScrollContainer bounces={false} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
                <BaseView
                    bg={theme.isDark ? COLORS.DARK_PURPLE : theme.colors.background}
                    flexDirection="column"
                    justifyContent="space-between"
                    w={100}
                    alignItems="flex-start"
                    pb={24}
                    gap={8}>
                    <BaseView flexDirection="row" alignItems="flex-start" gap={12}>
                        <BaseIcon
                            name="icon-globe"
                            size={20}
                            color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900}
                        />
                        <BaseText typographyFont="subTitleSemiBold">{LL.SB_SELECT_LANGUAGE()}</BaseText>
                    </BaseView>
                    <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                        {LL.SB_SELECT_LANGUAGE_DESC()}
                    </BaseText>
                </BaseView>
                <BottomSheetFlatList
                    data={languages}
                    keyExtractor={({ code }) => code}
                    ItemSeparatorComponent={languagesListSeparator}
                    layout={LinearTransition}
                    renderItem={({ item }) => {
                        const isSelected = item.code === selectedLanguage

                        return (
                            <BaseTouchableBox
                                haptics="Light"
                                action={() => {
                                    handleSelectLanguage(item.code as Locales)
                                }}
                                containerStyle={styles.languageContainer}
                                innerContainerStyle={[
                                    styles.innerContainer,
                                    isSelected && styles.selectedInnerContainer,
                                ]}>
                                <BaseText
                                    numberOfLines={1}
                                    typographyFont={isSelected ? "bodySemiBold" : "body"}
                                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                                    style={isSelected && styles.selectedItem}>
                                    {item.name}
                                </BaseText>
                                {isSelected && (
                                    <BaseIcon
                                        name="icon-check"
                                        color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                                        size={24}
                                    />
                                )}
                            </BaseTouchableBox>
                        )
                    }}
                    showsVerticalScrollIndicator={false}
                />
            </NestableScrollContainer>
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        background: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : theme.colors.background,
        },
        languageContainer: {
            borderRadius: 8,
        },
        innerContainer: {
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 22,
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
            borderRadius: 8,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        selectedInnerContainer: {
            borderWidth: 2,
            borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
        },
        list: {
            height: "95%",
        },
        selectedItem: {
            color: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
        },
    })
