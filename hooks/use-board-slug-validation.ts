// hooks/use-board-slug-validation.ts
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useBoardSlugValidation(slug: string) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    const debouncedCheck = useDebouncedCallback(async (slug: string) => {
        if (!slug || slug.length < 3) {
            setIsAvailable(null) // Reset ako je prekratak
            setIsChecking(false)
            return
        }

        setIsChecking(true)
        try {
            const res = await fetch(`/api/validate-board-slug?slug=${slug}`)
            const data = await res.json()
            setIsAvailable(data.available)
        } catch (error) {
            setIsAvailable(null) // Reset na error
        } finally {
            setIsChecking(false)
        }
    }, 500) // 500ms debounce

    useEffect(() => {
        setIsAvailable(null)
        setIsChecking(false)

        debouncedCheck(slug)
    }, [slug, debouncedCheck])

    return { isAvailable, isChecking }
}
