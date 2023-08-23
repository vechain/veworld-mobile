import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useState } from "react"
import { BaseBottomSheet } from "~Components"
import { DelegationType } from "~Model/Delegation"
import { selectDelegationUrls, useAppSelector } from "~Storage/Redux"
import { AddUrl, UrlList } from "./Components"

const snapPoints = ["40%"]

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (string: string) => void
    setNoDelegation: () => void
}

// component to select an account for delegation
export const SelectUrlBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            setSelectedDelegationUrl,
            selectedDelegationUrl,
            selectedDelegationOption,
            setNoDelegation,
            onClose,
        },
        ref,
    ) => {
        const [addUrlMode, setAddUrlMode] = useState(false)
        const [newUrl, setNewUrl] = useState("")
        const delegationUrls = useAppSelector(selectDelegationUrls)
        const onDismiss = () => {
            setAddUrlMode(false)
            setNewUrl("")
            if (
                selectedDelegationOption === DelegationType.URL &&
                !selectedDelegationUrl
            ) {
                setNoDelegation()
            }
        }

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                ref={ref}
                onDismiss={onDismiss}>
                {delegationUrls.length === 0 || addUrlMode ? (
                    <AddUrl
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                        newUrl={newUrl}
                        setNewUrl={setNewUrl}
                        addUrlMode={addUrlMode}
                        setAddUrlMode={setAddUrlMode}
                        onCloseBottomSheet={onClose}
                    />
                ) : (
                    <UrlList
                        setAddUrlMode={setAddUrlMode}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                        selectedDelegationUrl={selectedDelegationUrl}
                        onCloseBottomSheet={onClose}
                    />
                )}
            </BaseBottomSheet>
        )
    },
)
