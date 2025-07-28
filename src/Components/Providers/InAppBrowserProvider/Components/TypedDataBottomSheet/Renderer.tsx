import React, { PropsWithChildren, useMemo } from "react"
import { BaseView } from "~Components/Base"
import { HexUtils } from "~Utils"
import { BaseAdditionalDetail } from "../TransactionBottomSheet/ReceiptOutputRenderer/BaseAdditionalDetail"

const Container = ({ children }: PropsWithChildren) => {
    return (
        <BaseView flexDirection="column" gap={12}>
            {children}
        </BaseView>
    )
}

const Renderer = ({ value, label }: { value: unknown; label?: string }) => {
    const isHex = useMemo(() => typeof value === "string" && HexUtils.isValid(value), [value])

    if (value === null || value === undefined || typeof value === "symbol") return null
    if (typeof value === "object")
        return Object.entries(value).map(([key_, value_]) => (
            <Renderer
                value={value_}
                label={label ? `${label}->${key_}` : key_}
                key={label ? `${label}->${key_}` : key_}
            />
        ))

    return (
        <BaseAdditionalDetail
            label={label ?? ""}
            value={isHex ? <BaseAdditionalDetail.HexValue value={value as string} /> : value.toString()}
        />
    )
}

Renderer.Container = Container

export { Renderer }
