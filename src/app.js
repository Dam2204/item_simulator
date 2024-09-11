import express from "express";
import errorHandlingMiddleware from "./middlewares/error.handling.middleware.js";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/users.router.js";
import ItemRouter from "./routes/items.router.js";
import CharacterRouter from "./routes/character.router.js";

const app = express();
const PORT = 3018;

let tokenStorage = {}; // Refresh Token을 저장할 객체

app.use(express.json());
app.use(cookieParser());

app.use("/api", [UserRouter]);
app.use("/api", [CharacterRouter]);
app.use("/api", [ItemRouter]);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
