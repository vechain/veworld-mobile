import React from "react"
import { StyleSheet, ViewProps } from "react-native"
import { useTheme } from "~Hooks"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components/Base"
import { useI18nContext } from "~i18n"
import * as Sentry from "@sentry/react-native"

const ErrorView = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <BaseSafeArea grow={1}>
            <BaseView flexGrow={1} px={24} justifyContent="space-between">
                <BaseView>
                    <BaseSpacer height={90} />
                    <BaseText typographyFont="title">
                        {LL.COMMON_LBL_ERROR()}
                    </BaseText>
                    <BaseSpacer height={30} />
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
                    <BaseSpacer height={8} />
                    <BaseText typographyFont="body">
                        {LL.ERROR_GENERIC_BODY()}
                    </BaseText>
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
            return <ErrorView />
        } else {
            return this.props.children
        }
    }
}

export default ErrorBoundary
