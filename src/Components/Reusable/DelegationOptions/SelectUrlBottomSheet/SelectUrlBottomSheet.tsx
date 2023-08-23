import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useState } from "react"
import { BaseBottomSheet } from "~Components"
import { DelegationType } from "~Model/Delegation"
import { selectDelegationUrls, useAppSelector } from "~Storage/Redux"
import { AddUrl, UrlList } from "./Components"
import { useScrollableBottomSheet } from "~Hooks"

const snapPointsAddUrl = ["50%"]
const snapPointsUrlList = ["50%", "75%", "90%"]

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
        const [addUrlMode, _setAddUrlMode] = useState(false)
        const [newUrl, setNewUrl] = useState("")
        const delegationUrls = useAppSelector(selectDelegationUrls)
        const snapPoints =
            delegationUrls.length === 0 || addUrlMode
                ? snapPointsAddUrl
                : snapPointsUrlList
        const { scrollableBottomSheetProps, handleSheetChangePosition } =
            useScrollableBottomSheet({ data: delegationUrls, snapPoints })
        const onDismiss = () => {
            _setAddUrlMode(false)
            setNewUrl("")
            if (
                selectedDelegationOption === DelegationType.URL &&
                !selectedDelegationUrl
            ) {
                setNoDelegation()
            }
        }

        const setAddUrlMode = (s: boolean) => {
            _setAddUrlMode(s)
            ;(
                ref as RefObject<BottomSheetModalMethods>
            )?.current?.snapToIndex?.(0)
        }

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                ref={ref}
                onDismiss={onDismiss}
                onChange={handleSheetChangePosition}>
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
                        scrollableBottomSheetProps={scrollableBottomSheetProps}
                    />
                )}
            </BaseBottomSheet>
        )
    },
)
