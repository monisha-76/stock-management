const request =  require("supertest")
const app = require("../app")
const mongoose = require("mongoose");
const connectDB = require("../config/db")

describe("auth api test",()=>{

   
    const userdata = {
        username:"test5",
        password:"123456",
        role:"Seller"
    };

    // register test 
    test("should register",async()=>{
        const res = await request(app)
        .post("/api/auth/register")
        .send(userdata)

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message");
    },20000);

    //duplicate email


    test("check duplicate",async()=>{
        const res = await request(app)
        .post("/api/auth/register")
        .send(userdata)
        expect(res.statusCode).toBe(400);
        
    },20000)

  //login test

    test("should login",async()=>{
        const res = await request(app)
        .post("/api/auth/login")
        .send({
            username :"test4",
            password : "123456"
        })
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token")
    },20000);

    //invalid login

    test("login should fail with wrong password",async()=>{
        const res = await request(app)
        .post("/api/auth/login")
        .send({
            username :"testuser2",
            password : "123456"
        })
        expect(res.statusCode).toBe(400);
    },20000)

    afterAll(async () => {
        await mongoose.connection.close();
    });

});
