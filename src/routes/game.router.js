import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { gameDataClient } from '../utils/prisma/index.js';
import { userDataClient } from '../utils/prisma/index.js';

const router = express.Router();

/** 아이템 신규등록 API **/
router.post('/item', async (req, res) => {
  const { item_name, health, power, item_price } = req.body;

  try {
    const isExistItem = await gameDataClient.items.findFirst({
      where: {
        item_name,
      },
    });

    if (isExistItem) {
      return res.status(409).json({ message: '이미 존재하는 아이템입니다.' });
    }

    // Items 테이블에 아이템을 추가합니다.
    const newItem = await gameDataClient.items.create({
      data: {
        item_name,
        health,
        power,
        item_price,
      },
    });

    return res.status(201).json({ message: '아이템이 성공적으로 등록되었습니다.', newItem });
  } catch (error) {
    console.error('아이템 등록 중 에러 발생:', error);
    return res.status(500).json({ message: '아이템 등록 중 에러가 발생하였습니다.' });
  }
});

/** 아이템 구매 API (미구현, TypeError 확인 중) **/
router.post('/character/:character_id/purchase', authMiddleware, async (req, res) => {
  const characterId = parseInt(req.params.character_id, 10);
  const userId = req.user.id;
  const itemsToPurchase = req.body;
  try {
    const character = await userDataClient.characters.findFirst({
      where: {
        id: characterId,
        account_id: userId,
      },
    });

    if (!character) {
      return res.status(403).json({ message: '내 캐릭터가 아닙니다.' });
    }

    let totalCost = 0;
    for (const item of itemsToPurchase) {
      const { item_code, count } = item;
      const itemInfo = await gameDataClient.items.findUnique({
        where: { item_code },
        select: { item_price: true },
      });

      if (!itemInfo) {
        return res.status(404).json({ message: `아이템 코드 ${item_code}를 찾을 수 없습니다.` });
      }

      totalCost += itemInfo.item_price * count;
    }

    if (character.money < totalCost) {
      return res.status(400).json({ message: '잔고가 부족합니다.' });
    }

    await userDataClient.$transaction(async (userDataClient) => {
      for (const item of itemsToPurchase) {
        const { item_code, count } = item;
        await userDataClient.inventory.createMany({
          data: Array(count).fill({
            character_id: characterId,
            item_id: item_code,
          }),
        });
      }

      await userDataClient.characters.update({
        where: { id: characterId },
        data: { money: { decrement: totalCost } },
      });
    });

    const upDatedCharacter = await userDataClient.characters.findUnique({
      where: { id: characterId },
      select: { money: true },
    });

    return res.status(200).json({
      message: '아이템을 구매했습니다.',
      money: upDatedCharacter.money,
    });
  } catch (error) {
    console.error('아이템 구매 중 에러 발생:', error);
    return res.status(500).json({ message: '아이템 구매 중 에러가 발생하였습니다.' });
  }
});

/** 아이템 목록 조회 API **/
router.get('/items', async (req, res) => {
  try {
    const items = await gameDataClient.items.findMany({
      select: {
        item_code: true,
        item_name: true,
        item_price: true,
      },
    });

    return res.status(200).json(items);
  } catch (error) {
    console.error('아이템 조회 중 에러 발생:', error);
    return res.status(500).json({ message: '아이템 조회 중 에러가 발생하였습니다.' });
  }
});

/** 아이템 상세 조회 API **/
router.get('/items/:item_code', async (req, res) => {
  const itemCode = parseInt(req.params.item_code, 10);

  try {
    const item = await gameDataClient.items.findFirst({
      where: { item_code: itemCode },
      select: {
        item_code: true,
        item_name: true,
        health: true,
        power: true,
        item_price: true,
      },
    });

    if (!item) {
      return res.status(404).json({ message: '존재하지 않는 아이템입니다.' });
    }

    const itemWithStats = {
      item_code: item.item_code,
      item_name: item.item_name,
      item_stat: { health: item.health, power: item.power },
      item_price: item.item_price,
    };

    return res.status(200).json(itemWithStats);
  } catch (error) {
    console.error('아이템 상세 조회 중 에러 발생:', error);
    return res.status(500).json({ message: '아이템 상세 조회 중 에러가 발생하였습니다.' });
  }
});

/** 아이템 수정 API **/
router.put('/items/:item_code', async (req, res) => {
  const itemId = parseInt(req.params.item_code, 10);
  const { item_name, health, power } = req.body;

  try {
    const existingItem = await gameDataClient.items.findUnique({
      where: {
        item_code: itemId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ message: '존재하지 않는 아이템입니다.' });
    }

    const updatedItem = await gameDataClient.items.update({
      where: {
        item_code: itemId,
      },
      data: {
        item_name,
        health,
        power,
      },
    });

    return res.status(200).json({ message: '아이템이 정상적으로 수정되었습니다.', updatedItem });
  } catch (error) {
    console.error('아이템 수정 중 에러 발생:', error);
    return res.status(500).json({ message: '아이템 수정 중 에러가 발생하였습니다.' });
  }
});

export default router;
