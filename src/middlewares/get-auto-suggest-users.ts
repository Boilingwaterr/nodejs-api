import { RequestHandler } from 'express-serve-static-core'
import { users } from '../model/user'

export const getAutoSuggestUsers:RequestHandler = ({ query: { loginSubstring } }, res, next) => {
  if (typeof loginSubstring === 'string') {
    const suggestUsers = users.filter(({ login }) => login.startsWith(loginSubstring)).sort((a, b) => {
      if (a.login < b.login) { return -1 }
      if (a.login > b.login) { return 1 }
      return 0
    })

    res.json(suggestUsers)
  } else if (Array.isArray(loginSubstring)) {
    res.status(400).json({ message: 'Expected string. Got array instead.' })
  } else {
    next()
  }
}
