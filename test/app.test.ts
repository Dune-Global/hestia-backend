import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import express from "express";
import router from "../src/api/routes/v1";

const app = express();
app.use(router);

describe("Test /tryme route", () => {
  test("It should return Hello World!", async () => {
    const response = await request(app).get("/tryme");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello World!");
  });
});
