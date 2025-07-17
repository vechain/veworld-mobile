import { EventResult } from "../AbiManager"
import { BusinessEvent } from "./types"
import { getEventValue } from "./utils"

export const convertEventResultAliasRecordIntoParams = (
    record: Record<string, EventResult>,
    item: BusinessEvent,
    originValue: string,
) => {
    return Object.fromEntries(
        item.paramsDefinition.map(param => {
            const value = getEventValue(record[param.eventName], param.name, originValue)
            return [param.businessEventName, value]
        }),
    )
}
