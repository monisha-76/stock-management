const request = require("supertest");
const app = require("../app")
const mongoose = require("mongoose");
const product = require("../models/Product")


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

let buyertoken
let sellertoken;
const productid = "68600f9109720f78a0c66e53"

describe("product booking test",()=>{

    beforeAll(async()=>{
        const res = await request(app)
        .post("/api/auth/login")
        .send({
            username:"buyer",
            password:"123456"
        })

        buyertoken = res.body.token

        const res2 = await request(app)
        .post("/api/auth/login")
        .send({
            username:"seller",
            password:"123456"
        })

        sellertoken = res2.body.token;
    },20000)

    test("product quantity reduction", async () => {

    const beforeProduct = await Product.findById(productid);

    await request(app)
    .post(`/api/orders/${productid}`)
    .set("Authorization",`Bearer ${buyertoken}`)
    .send({
        quantity:2,
        address:"madhurai"
    })

    const afterProduct = await Product.findById(productid);

    expect(afterProduct.quantity).toBe(beforeProduct.quantity - 2);

},20000)

    //book if quantity available
    test("purchase if quantity is avilable",async()=>{
        const res = await request(app)
        .post(`/api/orders/${productid}`)
        .set("Authorization",`Bearer ${buyertoken}`)
        .send({
          quantity:4,
          address:"anna nagar chennai institute of technology"
        })
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty("order");
    },20000);

    //quantity is not enough
    test("product quantity is not enough",async()=>{
        const res = await request(app)
        .post(`/api/orders/${productid}`)
        .set("Authorization",`Bearer ${buyertoken}`)
        .send({
           quantity : 20,
           address :"stalin nagar  kattupakkam"
        })
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/stock/i);

    },20000);

    //purchase without token
    test("purchase without token",async()=>{
        const res = await request(app)
        .post(`/api/orders/${productid}`)
        .send({
            quantity:2,
            address :"madhurai"
        })
        expect(res.statusCode).toBe(401);
    },20000)

     test("check seller purchase i quantity is avilable",async()=>{
        const res = await request(app)
        .post(`/api/orders/${productid}`)
        .set("Authorization",`Bearer ${sellertoken}`)
        .send({
          quantity:4,
          address:"anna nagar chennai institute of technology"
        })
        expect(res.statusCode).toBe(403)
    },20000);
   
    afterAll(async()=>{
        await mongoose.connection.close()
    })
   
   
    })
