import { AbiEventParameter, AbiParameterToPrimitiveType } from "abitype"
import abi from "~Generated/abi"
import businessEvents from "~Generated/businessEvents"

type ValueOf<T> = T[keyof T]

type OutputArrayToObject<TParameters extends any[] | readonly any[]> = TParameters extends readonly [
    infer First,
    ...infer Rest,
]
    ? First extends AbiEventParameter & { name: string }
        ? {
              [key in First["name"]]: AbiParameterToPrimitiveType<First>
          } & OutputArrayToObject<Rest>
        : never
    : {}

export type ReceiptOutput = {
    clauseIndex: number
    address?: string
} & (
    | ValueOf<{
          [key in keyof typeof abi]: {
              name: key
              params: OutputArrayToObject<(typeof abi)[key]["inputs"]>
          }
      }>
    | ValueOf<{
          [key in keyof typeof businessEvents]: {
              name: key
              params: OutputArrayToObject<(typeof businessEvents)[key]["inputs"]>
          }
      }>
    | {
          name: "VET_TRANSFER(address,address,uint256)"
          params: {
              from: string
              to: string
              amount: bigint
          }
      }
    | {
          name: "___INTERNAL_UNKNOWN___"
          params: {}
      }
)

const FAKE_SIGNATURE_REGEX = /(.*)\(/

export const stripFakeSignature = (signature: string) => {
    if (!FAKE_SIGNATURE_REGEX.test(signature)) return signature
    return FAKE_SIGNATURE_REGEX.exec(signature)?.[1]
}
