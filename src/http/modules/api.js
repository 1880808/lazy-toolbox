import { post } from '../request'

export function login (params, config) {
    return post('http://lazytoolbox.com/api/login', params, config)
}
