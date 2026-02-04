"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes"

export function ThemeProvider(props: NextThemesProviderProps) {
  return <NextThemesProvider {...props} />
}

export const useTheme = useNextTheme
