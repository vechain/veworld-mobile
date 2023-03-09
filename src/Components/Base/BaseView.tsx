import { FlexAlignType } from "react-native"

export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse"
export type JustifyContent =
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"
export type FlexWrap = "wrap" | "nowrap" | "wrap-reverse"

export type AlignSelf = FlexAlignType | "auto"

export type AlignContent =
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "space-between"
    | "space-around"

export type Display = "flex" | "none"

export type Position = "absolute" | "relative"
