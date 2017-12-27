import { createSelector, createStructuredSelector } from 'reselect'
import { getCurrentAccount } from 'selectors/blockchain'
import { firstOlympiaUsersSelectorAsList, meSelector } from '../store/selectors'

const usersSelector = createSelector(
  firstOlympiaUsersSelectorAsList,
  meSelector,
  (firstUsers, me) => {
    if (!me) {
      return firstUsers
    }

    if (!firstUsers) {
      return undefined
    }

    const foundUser = firstUsers ? firstUsers.find(user => user.account === me.account) : undefined
    const dataTable = foundUser ? firstUsers : firstUsers.push(me)

    return dataTable
  },
)

export default createStructuredSelector({
  data: usersSelector,
  myAccount: getCurrentAccount,
})