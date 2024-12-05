import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseSafeArea, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const UserCreateVns = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [subdomain, setSubdomain] = useState("")

    const { styles } = useThemedStyles(baseStyles)

    const onSetSubdomain = useCallback((value: string) => {
        setSubdomain(value)
    }, [])

    return (
        <BaseSafeArea grow={1} style={[styles.container]}>
            <BaseView style={[styles.contentContainer]}>
                {/* Title */}
                <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                    <BaseText typographyFont="subTitleBold">{"Username"}</BaseText>
                </BaseView>
                <BaseSpacer height={24} />
                {/* Body */}
                <BaseView flexGrow={1}>
                    <BaseText typographyFont="body">
                        {"You can claim for free your unique username for this wallet:"}
                    </BaseText>
                    <BaseSpacer height={40} />
                    {/* Input container */}
                    <BaseView>
                        <BaseView mb={8} flexDirection="row" justifyContent="space-between">
                            <BaseText typographyFont="subSubTitleBold" style={[styles.inputLabel]}>
                                {"Username"}
                            </BaseText>
                            <BaseView flexDirection="row">
                                <BaseText typographyFont="caption" style={[styles.inputLabel]}>
                                    {"Powered by"}{" "}
                                </BaseText>
                                <BaseText typographyFont="captionSemiBold" style={[styles.inputLabel]}>
                                    {"vet.domains"}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                        <BaseTextInput
                            placeholder="Write your username"
                            value={subdomain}
                            setValue={onSetSubdomain}
                            rightIcon={<BaseText typographyFont="body">{".veworld.vet"}</BaseText>}
                        />
                    </BaseView>
                </BaseView>
                {/* Footer */}
                <BaseView flexDirection="row" w={100} style={[styles.footerContainer]}>
                    {!isLoading && (
                        <BaseButton variant="outline" flex={1} action={() => {}}>
                            {"Skip"}
                        </BaseButton>
                    )}
                    <BaseButton
                        flex={1}
                        disabled={isLoading || !subdomain}
                        action={() => {
                            setIsLoading(true)
                        }}>
                        {isLoading ? "Confirming..." : "Confirm"}
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: { marginBottom: 24 },
        contentContainer: {
            flexGrow: 1,
            padding: 24,
        },
        footerContainer: {
            gap: 16,
        },
        inputLabel: {
            color: theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600,
        },
    })
