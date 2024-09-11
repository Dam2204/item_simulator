import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/sign-up", async (req, res, next) => {
  const { account, password, confirm_password, name } = req.body;
  const isExistUser = await prisma.users.findFirst({
    where: {
      account,
    },
  });

  let regex = /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]+$/;

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 계정입니다." });
  }
  if (password.length < 6) {
    return res
      .status(409)
      .json({ message: "비밀번호는 6글자 이상 입력해주세요." });
  }
  if (password !== confirm_password) {
    return res.status(409).json({ message: "비밀번호가 일치하지 않습니다." });
  }
  if (!regex.test(account)) {
    console.log(account);
    return res
      .status(409)
      .json({ message: "계정 명은 영어 소문자 + 숫자 조합으로 입력해주세요." });
  }

  // 사용자 비밀번호를 암호화합니다.
  const hashedPassword = await bcrypt.hash(password, 10);
  // Users 테이블에 사용자를 추가합니다.
  const user = await prisma.users.create({
    data: { account, password: hashedPassword, name },
  });

  return res
    .status(201)
    .json({ message: `${name}님의 ${account} 계정 생성이 완료되었습니다.` });
});

/** 로그인 API **/
router.post("/sign-in", async (req, res, next) => {
  const { account, password } = req.body;
  const ACCESS_TOKEN_SECRET_KEY = `Sparta`;

  const user = await prisma.users.findFirst({ where: { account } });

  if (!user)
    return res.status(401).json({ message: "존재하지 않는 계정입니다." });
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

  // Access Token을 생성하는 함수
  function createAccessToken(account) {
    const accessToken = jwt.sign(
      { account: account }, // JWT 데이터
      ACCESS_TOKEN_SECRET_KEY, // Access Token의 비밀 키
      { expiresIn: "1h" } // Access Token이 30분 뒤에 만료되도록 설정합니다.
    );

    return accessToken;
  }

  // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
  const accessToken = createAccessToken(account);

  // 헤더에 토큰을 포함시킨다.
  res.header("authorization", `Bearer ${accessToken}`);
  return res.status(200).json({ message: "로그인에 성공하였습니다." });
});

/** 사용자 조회 API **/
router.get("/users", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      account: true,
      createdAt: true,
      updatedAt: true,
      characters: {
        // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
        select: {
          character_name: true,
          health: true,
          power: true,
          money: true,
        },
      },
    },
  });

  return res.status(200).json({ data: user });
});

export default router;
