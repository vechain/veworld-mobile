import React, { useCallback, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { useAppReset, useTheme } from "~Hooks"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
} from "~Components"
import { useI18nContext } from "~i18n"
import * as Sentry from "@sentry/react-native"

const ErrorView = ({ resetErrorState }: { resetErrorState: () => void }) => {
    const appReset = useAppReset()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const [isChecked, setIsChecked] = useState(false)

    const onButtnPress = useCallback(() => {
        appReset()
        setTimeout(() => {
            resetErrorState()
        }, 200)
    }, [appReset, resetErrorState])

    return (
        <BaseSafeArea grow={1}>
            <BaseView
                flexGrow={1}
                px={24}
                pt={40}
                pb={70}
                justifyContent="space-between">
                <BaseView>
                    <BaseText typographyFont="title">
                        {LL.COMMON_LBL_ERROR()}
                    </BaseText>

                    <BaseSpacer height={24} />

                    <BaseIcon
                        name={"close-circle-outline"}
                        size={70}
                        color={theme.colors.danger}
                        style={styles.icon}
                    />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitle">
                        {LL.ERROR_GENERIC_SUBTITLE()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.ERROR_GENERIC_BODY_01()}
                    </BaseText>

                    <BaseText typographyFont="bodyBold">
                        {LL.ERROR_GENERIC_BODY_02()}
                    </BaseText>
                </BaseView>

                <BaseView>
                    <BaseText typographyFont="body">
                        {LL.BD_RESET_APP_02()}
                    </BaseText>

                    <BaseText
                        typographyFont="body"
                        color={theme.colors.danger}
                        my={10}>
                        {LL.BD_RESET_APP_DISCLAIMER()}
                    </BaseText>

                    <CheckBoxWithText
                        isChecked={isChecked}
                        text={LL.BTN_RESET_APP_CHECKBOX()}
                        checkAction={setIsChecked}
                        testID="reset-app-checkbox"
                    />

                    <BaseButton
                        title={LL.BTN_RESET_APP().toUpperCase()}
                        action={onButtnPress}
                        disabled={!isChecked}
                        haptics="Warning"
                    />
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    icon: { alignItems: "flex-start" },
})

export class ErrorBoundary extends React.Component<ViewProps> {
    state = {
        hasError: false,
        error: null,
        errorInfo: null,
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    onResetErrorState = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    componentDidCatch(error: Error, errorInfo: any) {
        Sentry.captureException(error)
        Sentry.captureMessage(`Error Boundary Error : ${error} - ${errorInfo}`)

        this.setState({
            error,
            errorInfo,
        })
    }

    render() {
        if (this.state.hasError) {
            return <ErrorView resetErrorState={this.onResetErrorState} />
        } else {
            return this.props.children
        }
    }
}

export default ErrorBoundary
