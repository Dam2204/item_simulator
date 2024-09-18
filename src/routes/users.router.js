import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
import { userDataClient } from '../utils/prisma/index.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const { account, password, confirm_password, name } = req.body;
    const isExistUser = await userDataClient.account.findFirst({
      where: {
        account,
      },
    });

    const regex = /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]+$/;

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 계정입니다.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 6글자 이상 입력해주세요.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    if (!regex.test(account)) {
      console.log(account);
      return res
        .status(400)
        .json({ message: '계정 명은 영어 소문자 + 숫자 조합으로 입력해주세요.' });
    }

    // 사용자 비밀번호를 암호화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);
    // Users 테이블에 사용자를 추가합니다.
    const user = await userDataClient.account.create({
      data: { account, password: hashedPassword, name },
    });

    return res.status(201).json({
      user_id: user.id,
      account: user.account,
      name: user.name,
    });
  } catch (error) {
    console.error('회원가입 중 에러 발생:', error);
    return res.status(500).json({ message: '회원가입 중 에러가 발생하였습니다.' });
  }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  try {
    const { account, password } = req.body;

    const user = await userDataClient.account.findFirst({ where: { account } });

    if (!user) return res.status(401).json({ message: '존재하지 않는 계정입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    // Access Token을 생성하는 함수

    const accessToken = jwt.sign(
      { user_id: user.id }, // JWT 데이터
      'jwt-secret', // Access Token의 비밀 키
      { expiresIn: '6h' }, // Access Token이 6시간 뒤에 만료되도록 설정합니다.
    );

    // 쿠키에 토큰을 포함시킨다.
    res.cookie('authorization', `Bearer ${accessToken}`);
    return res.status(200).json({ message: '로그인에 성공하였습니다.' });
  } catch (error) {
    console.error('로그인 중 에러 발생:', error);
    return res.status(500).json({ message: '로그인 중 에러가 발생하였습니다.' });
  }
});

/** 캐릭터 생성 API **/
router.post('/character', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const accountId = req.user.id;

  try {
    const isExistCharacter = await userDataClient.characters.findUnique({
      where: { name },
    });

    if (isExistCharacter) {
      return res.status(409).json({ message: '이미 존재하는 캐릭터 명입니다.' });
    }

    const newCharacter = await userDataClient.characters.create({
      data: {
        name,
        account_id: accountId,
        health: 500,
        power: 100,
        money: 10000,
        inventory: {
          create: [],
        },
        equipment: {
          create: [],
        },
      },
      include: {
        inventory: true,
        equipment: true,
      },
    });

    return res.status(200).json({ id: newCharacter.id });
  } catch (error) {
    console.error('캐릭터 생성 중 에러 발생:', error);
    return res.status(500).json({ message: '캐릭터 생성 중 오류가 발생했습니다.' });
  }
});

/** 캐릭터 삭제 API **/
router.delete('/character/:id', authMiddleware, async (req, res) => {
  const characterId = parseInt(req.params.id, 10);
  const accountId = req.user.id;

  try {
    const character = await userDataClient.characters.findUnique({
      where: { id: characterId },
      include: { account: true },
    });

    if (!character) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }
    if (character.account_id !== accountId) {
      return res.status(403).json({ message: '캐릭터를 삭제할 권한이 없습니다.' });
    }

    await userDataClient.characters.delete({
      where: { id: characterId },
    });

    return res.status(200).json({ message: '캐릭터를 성공적으로 삭제했습니다' });
  } catch (error) {
    console.error('캐릭터 삭제 중 에러 발생:', error);
    return res.status(500).json({ message: '캐릭터 삭제 중 오류가 발생했습니다.' });
  }
});

/** 캐릭터 상세 조회 API **/
router.get('/character/:id', authMiddleware, async (req, res) => {
  const characterId = parseInt(req.params.id, 10);
  const accountId = req.user.id;

  try {
    const character = await userDataClient.characters.findFirst({
      where: { id: characterId },
      include: {
        account: true,
        inventory: true,
        equipment: true,
      },
    });

    if (!character) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }

    const isOwner = character.account_id === accountId;

    const characterData = {
      name: character.name,
      health: character.health,
      power: character.power,
    };

    if (isOwner) {
      characterData.money = character.money;
    }
    return res.status(200).json(characterData);
  } catch (error) {
    console.error('캐릭터 조회 중 에러 발생:', error);
    return res.status(500).json({ message: '캐릭터 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
