import React, { useCallback, useMemo, useRef } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import Animated from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseTextInput, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    onTextChange: (text: string) => void
    onSubmit?: (text: string) => void
    filteredSearch?: string
}

export const SearchBar = ({ onTextChange, filteredSearch, onSubmit }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const inputRef = useRef<TextInput | null>(null)

    const handleOnSubmitEditing = useCallback(
        (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
            onSubmit?.(e.nativeEvent.text)
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
                size="sm"
                variant="ghost"
                leftIcon={<BaseIcon name="icon-x" size={16} color={theme.colors.text} />}
                action={onClear}
            />
        )
    }, [filteredSearch, onClear, theme.colors.text])

    return (
        <BaseView w={100} flexDirection="row" px={24} py={12}>
            <BaseView flex={1}>
                <Animated.View>
                    <BaseTextInput
                        placeholder={LL.DISCOVER_SEARCH()}
                        onChangeText={onTextChange}
                        onSubmitEditing={handleOnSubmitEditing}
                        value={filteredSearch}
                        style={styles.searchBar}
                        leftIcon="icon-search"
                        leftIconStyle={styles.searchBarIcon}
                        leftIconSize={16}
                        rightIcon={renderRightIcon}
                        rightIconSize={16}
                        rightIconStyle={styles.clearIcon}
                        rightIconAdornment={false}
                        ref={inputRef}
                    />
                </Animated.View>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        searchBar: {
            paddingVertical: 10,
            paddingLeft: 0,
            paddingRight: 0,
            height: 40,
        },
        searchBarIcon: {
            color: theme.colors.searchIcon.active,
        },
        clearIcon: {
            backgroundColor: theme.colors.transparent,
            borderColor: theme.colors.transparent,
            paddingHorizontal: 0,
        },
    })
