import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import type { RootState, AppThunkDispatch } from "./Types"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppThunkDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
