import { useRef } from "react"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils/Logger"

export const useRenderCounter = (view: string) => {
    let renders = useRef(0)
    debug(ERROR_EVENTS.APP, `${view} has rendered : ${renders.current++} times.`)
}
