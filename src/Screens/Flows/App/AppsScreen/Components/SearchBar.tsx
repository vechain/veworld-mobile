import React, { useCallback, useMemo, useRef, useState } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { BaseButton, BaseIcon, BaseTextInput } from "~Components"
import { Spinner } from "~Components/Reusable/Spinner"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    onTextChange: (text: string) => void
    onSubmit?: (text: string) => void | Promise<void>
    filteredSearch?: string
}

export const SearchBar = ({ onTextChange, filteredSearch, onSubmit }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const inputRef = useRef<TextInput | null>(null)
    const [loading, setLoading] = useState(false)

    const handleOnSubmitEditing = useCallback(
        async (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
            try {
                setLoading(true)
                await onSubmit?.(e.nativeEvent.text)
            } finally {
                setLoading(false)
            }
        },
        [onSubmit],
    )

    const onClear = useCallback(() => {
        onTextChange("")
        inputRef.current?.clear()
    }, [onTextChange])

    const renderRightIcon = useMemo(() => {
        if (!filteredSearch) return undefined
        if (filteredSearch.length === 0) return undefined
        return (
            <BaseButton
                testID="search-bar-clear-button"
                size="sm"
                variant="ghost"
                leftIcon={<BaseIcon name="icon-x" size={16} color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600} />}
                action={onClear}
                py={0}
            />
        )
    }, [filteredSearch, onClear, theme.isDark])

    const renderLeftIcon = useMemo(() => {
        if (loading) return <Spinner color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} />
        return <BaseIcon name="icon-search" size={16} color={theme.isDark ? COLORS.GREY_400 : COLORS.GREY_600} />
    }, [loading, theme.isDark])

    return (
        <BaseTextInput
            testID="search-bar-input"
            placeholder={LL.DISCOVER_SEARCH()}
            placeholderTextColor={COLORS.GREY_400}
            cursorColor={COLORS.GREY_300}
            onChangeText={onTextChange}
            onSubmitEditing={handleOnSubmitEditing}
            value={filteredSearch}
            style={styles.searchInput}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            leftIcon={renderLeftIcon}
            leftIconStyle={styles.searchInputLeftIcon}
            leftIconAdornment={false}
            leftIconSize={16}
            rightIcon={renderRightIcon}
            rightIconSize={16}
            rightIconStyle={styles.searchInputRightIcon}
            rightIconAdornment={false}
            ref={inputRef}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        searchContainer: {
            flex: 1,
            color: COLORS.GREY_50,
        },
        searchInputContainer: {
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        searchInput: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            color: theme.colors.text,
            borderRadius: 7,
            paddingLeft: 0,
        },
        searchInputLeftIcon: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            borderTopLeftRadius: 7,
            borderBottomLeftRadius: 7,
        },
        searchInputRightIcon: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            borderTopRightRadius: 7,
            borderBottomRightRadius: 7,
        },
        searchBar: {
            paddingVertical: 10,
            paddingLeft: 0,
            paddingRight: 0,
            height: 40,
            alignItems: "center",
        },
    })
