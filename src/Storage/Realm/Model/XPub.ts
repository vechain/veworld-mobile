import { Object } from "realm"

export class XPub extends Object<XPub> {
    publicKey!: string
    chainCode!: string
}
