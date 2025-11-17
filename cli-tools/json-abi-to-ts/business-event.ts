import { select } from "@inquirer/prompts"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const FAKE_SIGNATURE_REGEX = /(.*)\(/

export const stripFakeSignature = (signature: string) => {
    if (!FAKE_SIGNATURE_REGEX.test(signature)) return signature
    const matchArray = signature.match(FAKE_SIGNATURE_REGEX)!
    return matchArray[1]
}

export const validateAndUpdateBusinessEvent = async (
    _path: string,
    groupedEventsByCommonName: Record<string, string[]>,
    allEvents: Record<string, unknown>,
) => {
    const file = await readFile(_path, { encoding: "utf-8" })

    const parsedPath = path.parse(_path)

    const parsed = JSON.parse(file)

    for (let i = 0; i < parsed.events.length; i++) {
        const event = parsed.events[i]
        const strippedSignature = stripFakeSignature(event.name)
        //If no event matched, throw an error
        if (!groupedEventsByCommonName[strippedSignature]) {
            throw new Error(
                // eslint-disable-next-line max-len
                `[BusinessEventValidator]: Error at ${parsedPath.name}.\n${event.name} is not found in the provided ABIs with stripped signature: ${strippedSignature}.`,
            )
        }
        //If the event is already a valid event, skip it
        if (groupedEventsByCommonName[strippedSignature].includes(event.name)) continue

        //If there's only one event matching, then just return it
        if (groupedEventsByCommonName[strippedSignature].length === 1) {
            event.name = groupedEventsByCommonName[strippedSignature][0]
            continue
        }

        const result = await select({
            choices: groupedEventsByCommonName[strippedSignature].map(signature => ({
                name: signature,
                value: signature,
            })),
            message: `[ ${parsedPath.name + parsedPath.ext} ]: Select one of the following matching event for event ${
                event.alias
            }`,
        })

        event.name = result
    }

    parsed.inputs = parsed.paramsDefinition.map((paramDef: any) => {
        const foundEvt = parsed.events.find((u: any) => u.alias === paramDef.eventName)
        if (!foundEvt)
            throw new Error(
                // eslint-disable-next-line max-len
                `[BusinessEventValidator]: Error at ${parsedPath.name}. ${paramDef.eventName} not found in event aliases.`,
            )
        const foundRealEvent = allEvents[foundEvt.name]! as any
        const foundInput = foundRealEvent.inputs.find((input: any) => input.name === paramDef.name)
        if (!foundInput) {
            if (!["address", "origin"].includes(paramDef.name))
                throw new Error(
                    // eslint-disable-next-line max-len
                    `[BusinessEventValidator]: Error at ${parsedPath.name}. ${paramDef.name} of event ${paramDef.eventName} not found in the event schema.`,
                )

            return {
                type: "address",
                name: paramDef.businessEventName,
                internalType: "address",
                indexed: false,
            }
        }
        return {
            ...foundInput,
            indexed: false,
            name: paramDef.businessEventName,
        }
    })

    parsed.type = "event"

    return parsed
}
