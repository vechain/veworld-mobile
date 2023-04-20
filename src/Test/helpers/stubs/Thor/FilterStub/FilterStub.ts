import { eventFilterApplyStub, transferFilterApplyStub } from "./ApplyStub"

/**
 * Mock filter method of Connex.Thor
 * Originally create a transfer/event logs filter
 * @param kind
 * @param _criteria
 * @returns
 */
export function filterStub(
    kind: "event" | "transfer",
    _criteria: Connex.Thor.Filter.Criteria<"event" | "transfer">[],
): Connex.Thor.Filter<"event" | "transfer"> {
    return {
        range(_range: Connex.Thor.Filter.Range) {
            return this
        },

        order(_order: "asc" | "desc") {
            return this
        },

        cache(_hints: string[]) {
            return this
        },

        apply:
            kind === "event" ? eventFilterApplyStub : transferFilterApplyStub,
    }
}
