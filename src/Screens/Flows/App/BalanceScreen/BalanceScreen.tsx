/* eslint-disable react-native/no-inline-styles */
import { default as React } from "react"
import { TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { COLORS, SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import { IconKey } from "~Model"
import { selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { Glow } from "./Glow"
import { Header } from "./Header"

const GlassButton = ({ icon }: { icon: IconKey }) => {
    return (
        <TouchableOpacity>
            <LinearGradient
                colors={["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]}
                angle={0}
                style={{ padding: 12, borderRadius: 99 }}>
                <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
            </LinearGradient>
        </TouchableOpacity>
    )
}

const GlassButtonFull = ({ label, icon }: { label: string; icon: IconKey }) => {
    return (
        <BaseView flexDirection="column" gap={8} alignItems="center">
            <GlassButton icon={icon} />
            <BaseText typographyFont="captionSemiBold" color={COLORS.PURPLE_LABEL}>
                {label}
            </BaseText>
        </BaseView>
    )
}

export const BalanceScreen = () => {
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    return (
        <Layout
            bg="#1D173A"
            noBackButton
            fixedHeader={<Header />}
            noMargin
            body={
                <>
                    <BaseView style={{ position: "relative" }}>
                        <BaseView mt={32} flexDirection="row" gap={4} alignSelf="center">
                            <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                                {currencySymbol}
                            </BaseText>
                            <BaseText
                                style={{ fontSize: 36, fontWeight: 600, lineHeight: 40, fontFamily: "Inter-SemiBold" }}
                                color={COLORS.GREY_50}>
                                {99.999}
                            </BaseText>
                        </BaseView>

                        <BaseSpacer height={12} />
                        {/* The 24px container should be the pagination */}
                        <BaseSpacer height={24} />
                        <BaseSpacer height={12} />

                        <BaseView alignSelf="center" flexDirection="row" gap={24}>
                            <GlassButtonFull label="buy" icon="icon-plus" />
                            <GlassButtonFull label="receive" icon="icon-arrow-down" />
                            <GlassButtonFull label="send" icon="icon-arrow-up" />
                            <GlassButtonFull label="other" icon="icon-more-vertical" />
                        </BaseView>

                        <BaseSpacer height={64} />

                        {/* <LinearGradient
                            style={{
                                position: "absolute",
                                opacity: 0.25,
                                height: "100%",
                                width: "100%",
                                left: 0,
                                top: 0,
                            }}
                            colors={["#1D173A", COLORS.PURPLE]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        /> */}

                        <Glow
                            width={SCREEN_WIDTH * 1.2}
                            height={278}
                            style={{
                                position: "absolute",
                                bottom: "-30%",
                                left: 0,
                                zIndex: -1,
                            }}
                        />

                        {/* <BaseView
                            style={{
                                position: "absolute",
                                opacity: 0.25,
                                height: "100%",
                                width: "100%",
                                left: 0,
                                top: 0,
                            }}>
                            <AccountIcon size={1000} borderRadius={0} address={selectedAccount.address} />
                        </BaseView> */}
                    </BaseView>

                    <BaseView
                        style={{
                            transform: [{ translateY: -24 }],
                            backgroundColor: COLORS.LIGHT_GRAY,
                            padding: 16,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingBottom: SCREEN_HEIGHT,
                        }}>
                        <BaseText>TEST</BaseText>
                    </BaseView>
                </>
            }
        />
    )
}
