const request = require("supertest")
const app = require("../app")
const mongoose = require("mongoose");

jest.mock("cloudinary",()=>({
    v2: {
        config:jest.fn(),
      uploader:{
        upload:jest.fn().mockResolvedValue({
            secure_url:"http://fake-image-url.com/product.jpg"
        })
      }
    }
}));

let sellertoken;
let buyertoken;

describe("product",()=>{
 beforeAll(async()=>{
    //seller register
    await request(app)
    .post("/api/auth/register")
    .send({
        username:"sellertest3",
        password:"123456",
        role:"Seller"
    });

    //seller login

    const res1 = await request(app)
    .post("/api/auth/login")
    .send({
        username:"sellertest3",
        password:"123456"
    })

    sellertoken = res1.body.token;

      // buyer register 
    await request(app)
    .post("/api/auth/register")
    .send({
        username:"buyertest3",
        password:"123456",
        role:"Buyer"
    })

    //buyer login

    const res2 = await request(app)
    .post("/api/auth/login")
    .send({
        username:"buyertest3",
        password:"123456"
        
    })
    buyertoken = res2.body.token;
});


    //seller can create 
    
    test("seller can create",async()=>{
    const res = await request(app)
    .post("/api/products")
    .set("Authorization",`Bearer ${sellertoken}`)
    .send({
        name: "Laptop",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");
    },20000)

    //check buyer can addd
    test("byers can create or not",async()=>{
    const res = await request(app)
    .post("/api/products")
    .set("Authorization",`Bearer ${buyertoken}`)
    .send({
        name: "buyerLaptop",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
      });
      expect(res.statusCode).toBe(403);

    },20000)
    
    // check add without token
    test("request without token",async()=>{
        const res = await request(app)
        .post("/api/products")
        .send({
        name: "Tablet",
        price: 15000,
        quantity: 3,
        location: "Mumbai",
        image: "base64image"
        })
        expect(res.statusCode).toBe(401);
    },20000)

    //get products

    test("getproduct",async()=>{
        const res = await request(app)
        .get("/api/products")
        .set("Authorization",`Bearer ${sellertoken}`)
        expect(res.statusCode).toBe(200);
    },20000)

    afterAll(async()=>{
        await mongoose.connection.close();
    })

})


