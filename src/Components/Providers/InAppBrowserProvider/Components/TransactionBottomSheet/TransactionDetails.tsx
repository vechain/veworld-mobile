import { TransactionClause } from "@vechain/sdk-core"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components/Base"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { TransactionRequest } from "~Model"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"
import { selectFeaturedDapps, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { DappDetailsCard } from "../DappDetailsCard"
import { ReceiptOutputRenderer } from "./ReceiptOutputRenderer/ReceiptOutputRenderer"

type Props = {
    outputs: InspectableOutput[] | undefined
    clauses: TransactionClause[] | undefined
    request: TransactionRequest
}

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
            gap={0}
            showPagination
            rootStyle={styles.carouselRoot}
            bottomSheet
            forceSnap={false}
        />
    )
}

export const TransactionDetails = ({ request, outputs = [], clauses = [] }: Props) => {
    const allApps = useAppSelector(selectFeaturedDapps)
    const network = useAppSelector(selectSelectedNetwork)

    const receiptProcessor = useMemo(() => getReceiptProcessor(network.type), [network.type])
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const analyzedOutputs = useMemo(
        () => receiptProcessor.analyzeReceipt(outputs, selectedAccount.address),
        [receiptProcessor, selectedAccount.address, outputs],
    )

    const { icon, name, url } = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(request.appUrl).origin)
        if (foundDapp)
            return {
                icon: foundDapp.id
                    ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                    : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                name: foundDapp.name,
                url: request.appUrl,
            }

        return {
            name: request.appName,
            url: request.appUrl,
            icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(request.appUrl).origin}`,
        }
    }, [allApps, request.appName, request.appUrl])

    return (
        <DappDetailsCard name={name} icon={icon} url={url} showSpacer={false}>
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
    })
