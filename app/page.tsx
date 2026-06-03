import { getEssays } from '@/lib/essays/scan'
import { PersonalHome } from './home-client'

export default function Page() {
  return <PersonalHome essays={getEssays()} />
}
