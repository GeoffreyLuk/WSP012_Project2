import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 2;

export async function hashPassword(plainPassword: string) {
    const hash: string = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
}

export async function checkPassword(
    plainPassword: string,
    hashedPassword: string
) {
    console.log('inside hash.plain: ', plainPassword)
    console.log('inside hash.hash: ', hashedPassword)
    const isMatched: boolean = await bcrypt.compare(
        plainPassword,
        hashedPassword
    )
    console.log(isMatched)
    return isMatched
}