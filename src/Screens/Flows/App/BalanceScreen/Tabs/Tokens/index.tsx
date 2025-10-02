import React from "react"
import { BaseSpacer } from "~Components"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { TokensTopSection } from "./TokensTopSection"

export const Tokens = () => {
    return (
        <>
            <TokensTopSection />
            <BaseSpacer height={40} />
            <VeBetterDaoCard />
        </>
    )
}
