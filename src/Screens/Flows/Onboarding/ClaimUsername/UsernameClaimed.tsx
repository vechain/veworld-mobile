import React from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"

export const UsernameClaimed = () => {
    return (
        <BaseSafeArea>
            <BaseView flexGrow={1} p={24}>
                <BaseView flexGrow={1} alignItems="center" justifyContent="center">
                    <BaseIcon name="check-circle-outline" size={40} />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitleMedium">{"Username claimed!"}</BaseText>

                    <BaseSpacer height={8} />

                    <BaseText typographyFont="body">
                        {"Your unique username was claimed successfully and your wallet is now ready to use."}
                    </BaseText>
                </BaseView>
                <BaseView mb={24} flexDirection="row">
                    <BaseButton w={100} action={() => {}} selfAlign="flex-end">
                        {"Continue"}
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}
