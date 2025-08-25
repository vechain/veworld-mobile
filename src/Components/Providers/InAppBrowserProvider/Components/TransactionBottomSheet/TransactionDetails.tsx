import { TransactionClause } from "@vechain/sdk-core"
import React, { ComponentProps, useMemo } from "react"
import { StyleSheet } from "react-native"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components/Base"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { TransactionRequest } from "~Model"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { DappDetailsCard } from "../DappDetailsCard"
import { ReceiptOutputRenderer } from "./ReceiptOutputRenderer/ReceiptOutputRenderer"

type Props = {
    outputs: InspectableOutput[] | undefined
    clauses: TransactionClause[] | undefined
    request: TransactionRequest
} & Pick<ComponentProps<typeof DappDetailsCard>, "onShowDetails">

const safeJsonStringify = (arg: unknown) =>
    JSON.stringify(arg, (_, value) => {
        if (typeof value === "bigint") return value.toString()
        return value
    })

const TransactionCarousel = ({
    outputs,
    expanded,
    clauses,
}: {
    outputs: ReceiptOutput[]
    expanded: boolean
    clauses: TransactionClause[]
}) => {
    const { styles } = useThemedStyles(baseStyles)
    const outcomeItems = useMemo(() => {
        return outputs.map(
            output =>
                ({
                    content: <ReceiptOutputRenderer expanded={expanded} output={output} clauses={clauses} />,
                    closable: false,
                    name: safeJsonStringify(output),
                } satisfies CarouselSlideItem),
        )
    }, [clauses, expanded, outputs])
    return (
        <FullscreenBaseCarousel
            data={outcomeItems}
            baseWidth={SCREEN_WIDTH - 80}
            paginationAlignment="center"
            padding={0}
            gap={8}
            showPagination
            rootStyle={styles.carouselRoot}
            bottomSheet
            contentWrapperStyle={styles.contentWrapper}
        />
    )
}

export const TransactionDetails = ({ request, outputs = [], clauses = [], onShowDetails }: Props) => {
    const network = useAppSelector(selectSelectedNetwork)

    const receiptProcessor = useMemo(() => getReceiptProcessor(network.type, ["Generic", "Native"]), [network.type])
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const analyzedOutputs = useMemo(
        () => receiptProcessor.analyzeReceipt(outputs, selectedAccount.address),
        [receiptProcessor, selectedAccount.address, outputs],
    )

    return (
        <DappDetailsCard
            appName={request.appName}
            appUrl={request.appUrl}
            showSpacer={false}
            onShowDetails={onShowDetails}>
            {({ visible }) => {
                return <TransactionCarousel outputs={analyzedOutputs} expanded={visible} clauses={clauses} />
            }}
        </DappDetailsCard>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        carouselRoot: {
            gap: 16,
            marginTop: 16,
        },
        contentWrapper: {
            height: "100%",
        },
    })
