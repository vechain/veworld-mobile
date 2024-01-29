import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { useAppReset, useTheme } from "~Hooks"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseView, CheckBoxWithText } from "~Components"
import { useI18nContext } from "~i18n"
import * as Sentry from "@sentry/react-native"
import { ERROR_EVENTS } from "~Constants"
import { selectAppResetTimestamp, setAppResetTimestamp, useAppDispatch, useAppSelector } from "~Storage/Redux"
import moment from "moment"
import RNRestart from "react-native-restart"
import { useQueryClient } from "@tanstack/react-query"

const ErrorView = ({ resetErrorState }: { resetErrorState: () => void }) => {
    const appReset = useAppReset()
    const { LL } = useI18nContext()
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const appResetTimeStamp = useAppSelector(selectAppResetTimestamp)

    const [isChecked, setIsChecked] = useState(false)
    const [isTimestampChanged, setIsTimestampChanged] = useState(false)

    const onResetAppPress = useCallback(() => {
        appReset()
        dispatch(setAppResetTimestamp())
        setTimeout(() => {
            resetErrorState()
        }, 200)
    }, [appReset, dispatch, resetErrorState])

    const onReloadAppPress = useCallback(() => {
        setIsTimestampChanged(true)
        queryClient.removeQueries()
        dispatch(setAppResetTimestamp(moment().toISOString()))
        setTimeout(() => {
            RNRestart.restart()
        }, 300)
    }, [dispatch, queryClient])

    const RenderResetActionUI = useMemo(() => {
        const time = moment().subtract(3, "minutes")
        const checkShowResetUI = moment(appResetTimeStamp).isBetween(time, moment())

        if (checkShowResetUI && !isTimestampChanged) {
            return (
                <BaseView>
                    <BaseText typographyFont="body">{LL.BD_RESET_APP_02()}</BaseText>

                    <BaseText typographyFont="body" color={theme.colors.danger} my={10}>
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
                        action={onResetAppPress}
                        disabled={!isChecked}
                        haptics="Warning"
                    />
                </BaseView>
            )
        } else {
            return (
                <BaseView>
                    <BaseButton title={LL.BTN_CLOSE_APP().toUpperCase()} action={onReloadAppPress} haptics="Warning" />
                </BaseView>
            )
        }
    }, [LL, appResetTimeStamp, isChecked, isTimestampChanged, onReloadAppPress, onResetAppPress, theme.colors.danger])

    return (
        <BaseSafeArea grow={1}>
            <BaseView flexGrow={1} px={24} pt={40} pb={70} justifyContent="space-between">
                <BaseView>
                    <BaseText typographyFont="title">{LL.COMMON_LBL_ERROR()}</BaseText>

                    <BaseSpacer height={24} />

                    <BaseIcon name={"close-circle-outline"} size={70} color={theme.colors.danger} style={styles.icon} />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitle">{LL.ERROR_GENERIC_SUBTITLE()}</BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.ERROR_GENERIC_BODY_01()}
                    </BaseText>

                    <BaseText typographyFont="bodyBold">{LL.ERROR_GENERIC_BODY_02()}</BaseText>
                </BaseView>

                {RenderResetActionUI}
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
        try {
            let concatenatedString = JSON.stringify(error) + JSON.stringify(errorInfo)
            Sentry.captureException(concatenatedString, { tags: { Feature_Tag: ERROR_EVENTS.BOUNDARY } })
        } catch (_) {
            Sentry.captureException(`${ERROR_EVENTS.BOUNDARY} - ${error} - ${errorInfo}`, {
                tags: { Feature_Tag: ERROR_EVENTS.BOUNDARY },
            })
        }

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
