import { post } from '../request'

export function login (params, config) {
    return post('https://niufo.free.beeceptor.com/login', params, config)
}
