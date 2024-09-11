import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/** 아이템 신규등록 API **/
router.post("/new-item", async (req, res, next) => {
  const { item_name, item_status, item_price } = req.body;
  const isExistItem = await prisma.items.findFirst({
    where: {
      item_name,
    },
  });

  if (isExistItem) {
    return res.status(409).json({ message: "이미 존재하는 아이템입니다." });
  }

  // Items 테이블에 아이템을 추가합니다.
  const item = await prisma.items.create({
    data: { item_name, item_status, item_price },
  });

  return res.status(201).json({ message: "아이템 등록이 완료되었습니다." });
});

/** 아이템 목록 조회 API **/
router.get("/items", async (req, res, next) => {
  const items = await prisma.items.findMany({
    select: {
      item_code: true,
      item_name: true,
      item_price: true,
    },
  });

  return res.status(200).json({ data: items });
});

/** 아이템 상세 조회 API **/
router.get("/items/:item_code", async (req, res, next) => {
  const { item_code } = req.params;

  const item = await prisma.items.findFirst({
    where: { item_code: +item_code },
    select: {
      item_code: true,
      item_name: true,
      item_status: true,
      item_price: true,
    },
  });

  return res.status(200).json({ data: item });
});

/** 아이템 수정 API **/
router.put("/items/:item_code", async (req, res, next) => {
  const { item_code } = req.params;
  const { item_name, item_status } = req.body;

  const item = await prisma.items.findUnique({
    where: {
      item_code: +item_code,
    },
  });

  if (!item)
    return res.status(404).json({ message: "아이템이 존재하지 않습니다." });

  await prisma.items.update({
    data: {
      item_name: item_name,
      item_status: item_status,
    },
    where: {
      item_code: +item_code,
    },
  });

  return res
    .status(201)
    .json({ message: "아이템이 정상적으로 수정되었습니다." });
});

export default router;
