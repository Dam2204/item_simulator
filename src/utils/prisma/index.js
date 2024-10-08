import { PrismaClient as GameDataClient } from '../../../prisma/game/generated/GameDataClient/index.js';
import { PrismaClient as UserDataClient } from '../../../prisma/user/generated/UserDataClient/index.js';

export const gameDataClient = new GameDataClient({
  // Prisma를 이용해 게임 데이터베이스를 접근할 때, SQL을 출력해줍니다.
  log: ['query', 'info', 'warn', 'error'],

  // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력해줍니다.
  errorFormat: 'pretty',
}); // PrismaClient 인스턴스를 생성합니다.

export const userDataClient = new UserDataClient({
  // Prisma를 이용해 유저 데이터베이스를 접근할 때, SQL을 출력해줍니다.
  log: ['query', 'info', 'warn', 'error'],

  // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력해줍니다.
  errorFormat: 'pretty',
}); // PrismaClient 인스턴스를 생성합니다.
