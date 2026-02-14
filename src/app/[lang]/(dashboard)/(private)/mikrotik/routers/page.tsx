import { getDictionary } from '@/utils/getDictionary'
import RouterList from '@/views/mikrotik/routers/RouterList'

const RoutersPage = async () => {
  // Vars
  // You can use dictionary for i18n
  // const dictionary = await getDictionary(lang)

  return <RouterList />
}

export default RoutersPage
