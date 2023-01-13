import { useRef } from "react"

export const useRenderCounter = (view: string) => {
    let renders = useRef(0)
    console.log(`${view} has rendered : ${renders.current++} times.`)
}
