import { default as React, useMemo } from "react"
import { Linking, StyleSheet } from "react-native"
import { BaseButton, BaseCard, BaseIcon, BaseText } from "~Components"
import { TypedDataRenderer } from "~Components/Reusable/TypedDataRenderer"
import { useCopyClipboard, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LoginActivity } from "~Model"
import { StringUtils } from "~Utils"
import { ActivityDetail } from "../Type"
import { ActivityDetailItem } from "./ActivityDetailItem"

type Props = {
    activity: LoginActivity
}

const DappLoginDetails: React.FC<Props> = ({ activity }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()

    const valueTitleElement = useMemo(() => {
        switch (activity.kind) {
            case "simple":
                return undefined
            case "certificate":
            case "typed-data":
                return (
                    <BaseButton
                        textColor={theme.colors.text}
                        variant="ghost"
                        size="sm"
                        px={0}
                        py={0}
                        typographyFont={"body"}
                        title={LL.COMMON_LBL_VALUE()}
                        style={styles.valueButton}
                        action={() => onCopyToClipboard(JSON.stringify(activity.value), LL.COMMON_LBL_VALUE())}
                        rightIcon={
                            <BaseIcon name="icon-copy" color={theme.colors.text} size={12} style={styles.valueIcon} />
                        }
                    />
                )
        }
    }, [LL, activity.kind, activity.value, onCopyToClipboard, styles.valueButton, styles.valueIcon, theme.colors.text])

    const details = useMemo(() => {
        const base = [
            {
                id: 1,
                title: LL.DAPP_LOGIN_METHOD(),
                value: LL[
                    `DAPP_LOGIN_METHOD_${StringUtils.replaceCharacter(
                        StringUtils.toUppercase(activity.kind),
                        "-",
                        "_",
                    )}`
                ](),
                typographyFont: "subSubTitleLight",
                underline: false,
            },
            {
                id: 2,
                title: LL.ORIGIN(),
                value: `${activity.linkUrl}`,
                typographyFont: "subSubTitleLight",
                underline: true,
                onValuePress: async () => await Linking.openURL(activity.linkUrl ?? ""),
            },
        ] satisfies ActivityDetail[]
        switch (activity.kind) {
            case "simple":
                return base
            case "certificate":
                return [
                    ...base,
                    {
                        id: 3,
                        title: valueTitleElement,
                        value: (
                            <BaseCard>
                                <BaseText>{activity.value.payload.content || ""}</BaseText>
                            </BaseCard>
                        ),
                        typographyFont: "subSubTitle",
                        underline: false,
                    },
                ] satisfies ActivityDetail[]
            case "typed-data":
                return [
                    ...base,
                    {
                        id: 3,
                        title: valueTitleElement,
                        value: (
                            <BaseCard>
                                <TypedDataRenderer value={activity.value.value} />
                            </BaseCard>
                        ),
                        typographyFont: "subSubTitle",
                        underline: false,
                    },
                ] satisfies ActivityDetail[]
        }
    }, [LL, activity.kind, activity.linkUrl, activity.value, valueTitleElement])
    return (
        <>
            {details.map((detail: ActivityDetail, index: number) => (
                <ActivityDetailItem key={detail.id} activityDetail={detail} border={index !== details.length - 1} />
            ))}
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        valueIcon: {
            marginLeft: 4,
        },
        valueButton: {
            paddingBottom: 5,
        },
    })

export default DappLoginDetails
