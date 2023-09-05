import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
} from "~Components"
import React, { useMemo } from "react"
import { Verify } from "@walletconnect/types/dist/types/core/verify"
import { COLORS } from "~Constants"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"

type Props = {
    verifyContext: Verify.Context | undefined
    confirmed: boolean
    setConfirmed: (confirmed: boolean) => void
}
export const UnknownAppMessage: React.FC<Props> = ({
    verifyContext,
    confirmed,
    setConfirmed,
}) => {
    const { LL } = useI18nContext()

    const isUnverified = useMemo(
        () => verifyContext?.verified.validation === "INVALID",
        [verifyContext],
    )
    const isUnknown = useMemo(
        () => verifyContext?.verified.validation === "UNKNOWN",
        [verifyContext],
    )

    if (!verifyContext || verifyContext.verified.validation === "VALID")
        return <></>

    if (isUnknown || isUnverified)
        return (
            <BaseView justifyContent="center" alignItems="center">
                <BaseSpacer height={24} />

                <BaseView
                    bg={isUnverified ? COLORS.PASTEL_RED : COLORS.PASTEL_ORANGE}
                    flexDirection={"row"}
                    alignItems={"center"}
                    style={baseStyles.warningBackground}>
                    <BaseView style={baseStyles.icon}>
                        <BaseIcon
                            size={40}
                            name="alert-outline"
                            color={
                                isUnverified
                                    ? COLORS.MEDIUM_RED
                                    : COLORS.MEDIUM_ORANGE
                            }
                        />
                    </BaseView>

                    <BaseView style={baseStyles.text}>
                        <BaseText>
                            {isUnverified
                                ? LL.APP_VERIFICATION_INVALID()
                                : LL.APP_VERIFICATION_UNKNOWN()}
                        </BaseText>
                    </BaseView>
                </BaseView>

                {verifyContext.verified.validation === "UNKNOWN" && (
                    <CheckBoxWithText
                        isChecked={confirmed}
                        text={LL.APP_VERIFICATION_CONFIRM()}
                        checkAction={setConfirmed}
                        testID="security-operation-app-checkbox"
                    />
                )}
            </BaseView>
        )

    return <></>
}

const baseStyles = StyleSheet.create({
    warningBackground: {
        width: "100%",
        height: 110,
        borderRadius: 20,
    },
    icon: {
        width: "30%",
        height: "100%",
        justifyContent: "center",
    },
    text: {
        width: "60%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
    },
})
