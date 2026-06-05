import { proxyApiToBackend } from '../utils/api-proxy'

export default defineEventHandler(async (event) => proxyApiToBackend(event))
