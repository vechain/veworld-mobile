import { useRef } from "react"
import { debug } from "~Utils/Logger"

export const useRenderCounter = (view: string) => {
    let renders = useRef(0)
    debug(`${view} has rendered : ${renders.current++} times.`)
}
