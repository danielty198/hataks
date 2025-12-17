import { useCookie } from "./useCookie";
const COOKIE_USER = 'hataks'
const useUser = () => useCookie(COOKIE_USER)

export default useUser