import express from 'express'
import { createUser, deleteUser, IUser, updateUser, users } from '../model/user'
import { getAutoSuggestUsers } from '../middlewares/get-auto-suggest-users'

export const router = express.Router()

enum Messages {
  NotFound = 'User not found.',
  Deleted = 'User was deleted.'
}

router.get('/users', getAutoSuggestUsers, (_, res) => {
  res.json(users)
})

router.get('/users/:id', (req, res) => {
  const currentUser = users.find(({ id }) => id === req.params.id)

  if (!currentUser || currentUser.isDeleted) {
    res.status(404).json({ message: Messages.NotFound })
  } else {
    res.json(currentUser)
  }
})

router.post('/users', (req, res) => {
  const { login, password, age }: Omit<IUser, 'id'> = req.body
  const user = createUser({ login, password, age })

  res.status(201).json({ id: user.id })
})

router.put('/users/:id', (req, res) => {
  const { login, password, age }: Omit<IUser, 'id'> = req.body
  const currentUser = users.find(({ id }) => id === req.params.id)

  if (!currentUser || currentUser.isDeleted) {
    res.status(404).json({ message: Messages.NotFound })
  } else {
    const result = updateUser(currentUser, { login, password, age })

    res.json(result)
  }
})

router.delete('/users/:id', (req, res) => {
  const currentUser = users.find(({ id }) => id === req.params.id)

  if (!currentUser || currentUser.isDeleted) {
    res.status(404).json({ message: Messages.NotFound })
  } else {
    deleteUser(currentUser)

    res.json({ message: Messages.Deleted })
  }
})
