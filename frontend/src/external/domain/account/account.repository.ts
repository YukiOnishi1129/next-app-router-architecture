import { Account } from './account'
import { AccountId } from './account-id'
import { Repository } from '../shared/repository'
import { Email } from '../shared/value-objects'

/**
 * Account repository interface
 */
export interface AccountRepository extends Repository<Account, AccountId> {
  findAll(): Promise<Account[]>
  findByEmail(email: Email): Promise<Account | null>
  findByIds(ids: AccountId[]): Promise<Account[]>
  existsByEmail(email: Email): Promise<boolean>
}
