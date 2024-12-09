import { useSession } from 'vinxi/http'

export function useAppSession() {
    return useSession<{ email: string, access: string, refresh: string }>({
        password: 'ChangeThisBeforeShippingToProdOrYouWillBeFired',
    })
}
