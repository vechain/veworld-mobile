import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView, CopyToClipboardAddress, JsonViewer } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { SignDataMessageRequest } from "~Model"

type Props = {
    request: SignDataMessageRequest
}

export const TypedDataDetails: React.FC<Props> = ({ request }) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <BaseView>
            <BaseText typographyFont="subTitleBold">{LL.SEND_DETAILS()}</BaseText>

            <BaseSpacer height={16} />
            <BaseView flexDirection="row" style={styles.detailRow}>
                <BaseView style={styles.detailCol}>
                    {/* Domain label */}
                    <BaseText typographyFont="bodyBold" style={styles.detailTitle}>
                        {LL.CONNECTED_APP_DOMAIN()}
                    </BaseText>

                    {/* URL label */}
                    <BaseText typographyFont="bodyBold">{LL.CONNECTED_APP_URL()}</BaseText>

                    {/* Contract label */}
                    <BaseText typographyFont="bodyBold" style={styles.detailTitle}>
                        {LL.CONNECTED_APP_CONTRACT()}
                    </BaseText>
                </BaseView>
                <BaseView style={styles.detailCol}>
                    {/* Domain value */}
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="bodyMedium" style={styles.detailValue}>
                            {request.domain.name}
                        </BaseText>
                        <BaseText typographyFont="body" style={[styles.detailValue, styles.detailVersionLabel]}>
                            {LL.CONNECTED_APP_VERSION()}
                        </BaseText>
                        <BaseText typographyFont="bodyMedium">{request.domain.version}</BaseText>
                    </BaseView>

                    {/* URL value */}
                    <BaseText typographyFont="bodyMedium" style={styles.detailValue}>
                        {request.origin}
                    </BaseText>

                    {/* Contract value */}
                    <CopyToClipboardAddress address={request.domain.verifyingContract ?? ""} lenghtBefore={12} />
                </BaseView>
            </BaseView>

            <BaseSpacer height={18} />
            <JsonViewer data={request.value as Record<string, string | number>} />
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
            textTransform: "uppercase",
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
