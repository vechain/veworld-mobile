import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { TypedData } from "~Model"
import { CopyToClipboardAddress } from "./CopyToClipboardAddress"
import { JsonViewer } from "./JsonViewer"

type Props = {
    typedData: Partial<TypedData>
    origin: string
}

export const TypedDataDetails: React.FC<Props> = ({ typedData, origin }) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView>
            <BaseView flexDirection="row" style={styles.detailRow}>
                <BaseView style={styles.detailCol}>
                    {/* Domain label */}
                    <BaseText typographyFont="bodyBold" style={styles.detailTitle}>
                        {LL.CONNECTED_APP_DOMAIN()}
                    </BaseText>

                    {/* URL label */}
                    <BaseText typographyFont="bodyBold" style={styles.detailTitle}>
                        {LL.CONNECTED_APP_URL()}
                    </BaseText>

                    {/* Contract label */}
                    <BaseText typographyFont="bodyBold" style={styles.detailTitle}>
                        {LL.CONNECTED_APP_CONTRACT()}
                    </BaseText>
                </BaseView>
                <BaseView style={styles.detailCol}>
                    {/* Domain value */}
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="bodyMedium" style={styles.detailValue}>
                            {typedData.domain?.name}
                        </BaseText>
                        <BaseText typographyFont="body" style={[styles.detailValue, styles.detailVersionLabel]}>
                            {LL.CONNECTED_APP_VERSION()}
                        </BaseText>
                        <BaseText typographyFont="bodyMedium">{typedData.domain?.version}</BaseText>
                    </BaseView>

                    {/* URL value */}
                    <BaseText typographyFont="bodyMedium" style={styles.detailValue}>
                        {origin}
                    </BaseText>

                    {/* Contract value */}
                    <CopyToClipboardAddress address={typedData.domain?.verifyingContract ?? ""} />
                </BaseView>
            </BaseView>

            <BaseSpacer height={18} />
            <JsonViewer data={typedData.value as Record<string, string | number>} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        detailRow: {
            gap: 24,
            justifyContent: "space-between",
            textAlign: "left",
            alignSelf: "flex-start",
        },
        detailCol: {
            gap: 8,
        },
        detailTitle: {
            flex: 1,
            textTransform: "capitalize",
        },
        detailVersionLabel: {
            opacity: 0.7,
            textTransform: "lowercase",
            marginHorizontal: 4,
        },
        detailValue: {
            textAlign: "left",
            fontWeight: "bold",
        },
    })
