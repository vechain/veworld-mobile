import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components/Base"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { TransactionRequest } from "~Model"
import { getReceiptProcessor, InspectableOutput } from "~Services/AbiService"
import { selectFeaturedDapps, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { DappDetailsCard } from "../DappDetailsCard"
import { ReceiptOutputRenderer } from "./ReceiptOutputRenderer/ReceiptOutputRenderer"

type Props = {
    outputs: InspectableOutput[] | undefined
    request: TransactionRequest
}

export const TransactionDetails = ({ request, outputs = [] }: Props) => {
    const allApps = useAppSelector(selectFeaturedDapps)
    const { styles } = useThemedStyles(baseStyles)
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

    const outcomeItems = useMemo(() => {
        return analyzedOutputs.map(
            output =>
                ({
                    content: <ReceiptOutputRenderer expanded={true} output={output} />,
                    closable: false,
                } satisfies CarouselSlideItem),
        )
    }, [analyzedOutputs])

    return (
        <DappDetailsCard name={name} icon={icon} url={url}>
            {({ visible: _visible }) => {
                return (
                    <FullscreenBaseCarousel
                        data={outcomeItems}
                        baseWidth={SCREEN_WIDTH - 40}
                        paginationAlignment="center"
                        padding={0}
                        gap={0}
                        showPagination
                        rootStyle={styles.carouselRoot}
                    />
                )
            }}
        </DappDetailsCard>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        carouselRoot: {
            gap: 16,
        },
    })
