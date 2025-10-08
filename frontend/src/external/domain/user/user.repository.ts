import { Repository } from "../shared/repository";
import { User } from "./user";
import { UserId } from "./user-id";
import { Email } from "../shared/value-objects";

/**
 * User repository interface
 */
export interface UserRepository extends Repository<User, UserId> {
  findAll(): Promise<User[]>;
  findByEmail(email: Email): Promise<User | null>;
  findByIds(ids: UserId[]): Promise<User[]>;
  existsByEmail(email: Email): Promise<boolean>;
}
