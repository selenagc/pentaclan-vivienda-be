import bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../shared/config/constants.js';

export class PasswordService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
