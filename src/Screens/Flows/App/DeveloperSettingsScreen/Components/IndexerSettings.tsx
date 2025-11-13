import React, { useCallback, useMemo } from "react"
import { z } from "zod"
import { BaseView } from "~Components"
import { BaseAccordionV2 } from "~Components/Base/BaseAccordionV2"
import { Feedback } from "~Components/Providers/FeedbackProvider"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"
import { Network } from "~Model"
import { selectIndexerUrls, selectNetworks, setIndexerUrl, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { ResettableTextInput, ResettableTextInputProps } from "./ResettableTextInput"

const IndexerInput = ({
    validationSchema,
    network,
}: Pick<ResettableTextInputProps, "validationSchema"> & { network: Network }) => {
    const { LL } = useI18nContext()
    const indexerUrls = useAppSelector(selectIndexerUrls)
    const dispatch = useAppDispatch()

    const onSave = useCallback(
        (value: string) => {
            dispatch(setIndexerUrl({ genesisId: network.genesis.id, url: value }))
            Feedback.show({
                message: LL.DEVELOPER_SETTING_INDEXER_UPDATED(),
                type: FeedbackType.ALERT,
                severity: FeedbackSeverity.SUCCESS,
            })
        },
        [LL, dispatch, network.genesis.id],
    )

    return (
        <ResettableTextInput
            label={network.name}
            placeholder={LL.COMMON_LBL_ENTER_THE({
                name: LL.COMMON_LBL_URL(),
            })}
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
        <BaseAccordionV2>
            <BaseAccordionV2.Header>
                <BaseAccordionV2.HeaderText>{LL.DEVELOPER_SETTING_INDEXER_TITLE()}</BaseAccordionV2.HeaderText>
                <BaseAccordionV2.HeaderIcon />
            </BaseAccordionV2.Header>
            <BaseAccordionV2.Content>
                <BaseView flexDirection="column" gap={8}>
                    <BaseAccordionV2.ContentDescription>
                        {LL.DEVELOPER_SETTING_INDEXER_DESCRIPTION()}
                    </BaseAccordionV2.ContentDescription>
                    {networks.map(network => (
                        <IndexerInput network={network} validationSchema={validationSchema} key={network.name} />
                    ))}
                </BaseView>
            </BaseAccordionV2.Content>
        </BaseAccordionV2>
    )
}
