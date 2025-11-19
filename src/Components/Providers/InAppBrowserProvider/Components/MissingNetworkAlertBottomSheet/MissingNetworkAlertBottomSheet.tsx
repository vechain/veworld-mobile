import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject } from "react"
import { BaseButton } from "~Components/Base/BaseButton"
import { DefaultBottomSheet } from "~Components/Reusable/BottomSheets/DefaultBottomSheet"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"

export const MissingNetworkAlertBottomSheet = React.forwardRef<BottomSheetModalMethods, {}>((_, ref) => {
    const { ref: intenralRef, onClose } = useBottomSheetModal({
        externalRef: ref as RefObject<BottomSheetModalMethods>,
    })

    return (
        <DefaultBottomSheet
            ref={intenralRef}
            icon={"icon-alert-triangle"}
            iconSize={40}
            title={"Network not detected"}
            description={
                // eslint-disable-next-line max-len
                "This app is running on a network that is not currently added to your wallet. To continue, please add the networks node URL."
            }
            mainButton={
                <BaseButton
                    w={100}
                    title={"Go to"}
                    action={() => {
                        onClose()
                    }}
                />
            }
            secondaryButton={
                <BaseButton
                    w={100}
                    variant="outline"
                    title={"Cancel"}
                    action={() => {
                        onClose()
                    }}
                />
            }
        />
    )
})
