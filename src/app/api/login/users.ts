// ** Fake user data and data type

// ** Please remove below user data and data type in production and verify user with Real Database
export type UserTable = {
  id: number
  name: string
  email: string
  image: string
  password: string
  role: string
}

// =============== Fake Data ============================

export const users: UserTable[] = [
  {
    id: 1,
    name: 'Skynity Admin',
    password: 'admin',
    email: 'admin@skynity.com',
    image: '/images/avatars/1.png',
    role: 'admin'
  }
]
