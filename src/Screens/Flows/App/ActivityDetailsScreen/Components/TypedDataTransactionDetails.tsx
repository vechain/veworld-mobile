import React from "react"
import { BaseSpacer, TypedDataDetails } from "~Components"
import { TypedDataActivity } from "~Model"

type Props = {
    activity: TypedDataActivity
}

const TypedDataTransactionDetails: React.FC<Props> = ({ activity }) => {
    return (
        <>
            <BaseSpacer height={8} />
            <TypedDataDetails typedData={activity.typedData} origin={activity.sender} />
        </>
    )
}

export default TypedDataTransactionDetails
