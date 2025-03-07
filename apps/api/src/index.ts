import { log } from "@repo/logger";
import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { mainRouter } from "./router";

const port = process.env.PORT || 5001;

const app = express();

app.disable("x-powered-by")
app.use(morgan("dev"))
app.use(urlencoded({ extended: true }))
app.use(json())
app.use(cors())

app.get("/status", (_, res) => {
    return res.json({ ok: true });
});

app.use("/", mainRouter);

app.listen(port, () => {
  log(`api running on ${port}`);
});