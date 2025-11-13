import React, { useCallback, useMemo } from "react"
import { z } from "zod"
import { BaseView } from "~Components"
import { Feedback } from "~Components/Providers/FeedbackProvider"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"
import { Network } from "~Model"
import { selectIndexerUrls, selectNetworks, setIndexerUrl, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { Accordion } from "./Accordion"
import { ResettableTextInput, ResettableTextInputProps } from "./ResettableTextInput"

const IndexerInput = ({
    validationSchema,
    network,
}: Pick<ResettableTextInputProps, "validationSchema"> & { network: Network }) => {
    const indexerUrls = useAppSelector(selectIndexerUrls)
    const dispatch = useAppDispatch()

    const onSave = useCallback(
        (value: string) => {
            dispatch(setIndexerUrl({ genesisId: network.genesis.id, url: value }))
            Feedback.show({
                message: "Indexer URL updated",
                type: FeedbackType.ALERT,
                severity: FeedbackSeverity.SUCCESS,
            })
        },
        [dispatch, network.genesis.id],
    )

    return (
        <ResettableTextInput
            label={network.name}
            placeholder="Enter the URL..."
            defaultValue={indexerUrls[network.genesis.id]}
            onSave={onSave}
            validationSchema={validationSchema}
        />
    )
}

export const IndexerSettings = () => {
    const { LL } = useI18nContext()
    const networks = useAppSelector(selectNetworks)

    const validationSchema = useMemo(
        () =>
            z
                .string({ message: LL.COMMON_ERROR_URL_NOT_VALID() })
                .url({ message: LL.COMMON_ERROR_URL_NOT_VALID() })
                .optional(),
        [LL],
    )

    return (
        <Accordion>
            <Accordion.Header>
                <Accordion.HeaderText>{LL.DEVELOPER_SETTING_INDEXER_TITLE()}</Accordion.HeaderText>
                <Accordion.HeaderIcon />
            </Accordion.Header>
            <Accordion.Content>
                <BaseView flexDirection="column" gap={8}>
                    <Accordion.ContentDescription>
                        {LL.DEVELOPER_SETTING_INDEXER_DESCRIPTION()}
                    </Accordion.ContentDescription>
                    {networks.map(network => (
                        <IndexerInput network={network} validationSchema={validationSchema} key={network.name} />
                    ))}
                </BaseView>
            </Accordion.Content>
        </Accordion>
    )
}
