import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/** 캐릭터 신규 생성 API **/
router.post("/characters", authMiddleware, async (req, res, next) => {
  const { user_Id } = req.header;
  const { character_name } = req.body;
  const isExistCharacter = await prisma.characters.findFirst({
    where: {
      character_name,
    },
  });

  if (isExistCharacter) {
    return res.status(409).json({ message: "이미 존재하는 계정입니다." });
  }
  if (!character_name) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  // Character 테이블에 사용자를 추가합니다.
  const character = await prisma.characters.create({
    data: {
      user_Id: +user_Id,
      character_name,
    },
  });

  return res.status(201).json({ message: "캐릭터 생성이 완료되었습니다." });
});

/** 캐릭터 조회 API **/
router.get(
  "/characters/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { character_id } = req.params;

    const character = await prisma.users.findFirst({
      where: { character_id: +character_id },
      select: {
        character_name: true,
        health: true,
        power: true,
        money: true,
      },
    });

    return res.status(200).json({ data: character });
  }
);

/** 캐릭터 삭제 API **/
router.delete(
  "/characters/:character_id",
  authMiddleware,
  async (req, res, next) => {
    const { character_id } = req.params;

    const character = await prisma.posts.findUnique({
      where: {
        character_id: +character_id,
      },
    });

    if (!character)
      return res.status(404).json({ message: "존재하지 않는 캐릭터입니다." });

    await prisma.posts.delete({ where: { postId: +postId } });

    return res
      .status(200)
      .json({ message: "캐릭터가 정상적으로 삭제되었습니다." });
  }
);

export default router;
