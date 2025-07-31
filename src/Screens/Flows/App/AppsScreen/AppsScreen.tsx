import React from "react"
import { BaseView, Layout } from "~Components"
import { EcosystemSection } from "./Components/Ecosystem"

export const AppsScreen = () => {
    return (
        <Layout
            title="Apps"
            hasTopSafeAreaOnly
            fixedBody={
                <BaseView flex={1} p={16} gap={16}>
                    <EcosystemSection />
                </BaseView>
            }
        />
    )
}
