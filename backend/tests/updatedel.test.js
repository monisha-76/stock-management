const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

jest.mock("cloudinary",()=>({
    v2:{
        config : jest.fn(),
        uploader:{
        upload:jest.fn().mockResolvedValue({
            secure_url:"http://fake-image-url.com/product.jpg"
        })
        }
    }
}));

let sellertoken;
let productid;
let buyertoken;
let sellertoken2;
const productidinvalid = "687089d8417a2c799fe51e035"
let admintoken;

describe("update and delete",()=>{
    
    beforeAll(async () => {


  const res = await request(app)
  .post("/api/auth/login")
  .send({
    username:"sellerup1",
    password:"123456"
  })

  sellertoken = res.body.token
  expect(res.body).toHaveProperty("token")



  const res3 = await request(app)
  .post("/api/auth/login")
  .send({
    username:"sellertocheck1",
    password:"123456"
  })

  sellertoken2 = res3.body.token
  expect(res3.body).toHaveProperty("token")


  const res1 = await request(app)
  .post("/api/auth/login")
  .send({
    username :"buyertocheck1",
    password:"123456"
  })

  buyertoken = res1.body.token
  expect(res1.body).toHaveProperty("token")



  const res4 = await request(app)
  .post("/api/auth/login")
  .send({
    username:"admincheck1",
    password:"123456"
  })

  admintoken = res4.body.token
  expect(res4.body).toHaveProperty("token")

},20000)

    //create a product

    test("create a product",async()=>{
        const res = await request(app)
        .post("/api/products")
        .set("Authorization",`Bearer ${sellertoken}`)
        .send({
        name: "Acer",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
        })
        expect(res.statusCode).toBe(201);

        productid = res.body.product._id;
    },20000)

    //seller can update 

    test("seller can upadte",async()=>{
        const res = await request(app)
        .put(`/api/products/${productid}`)
        .set("Authorization",`Bearer ${sellertoken}`)
        .send({
        name: " updated Acer",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
        })

        expect(res.statusCode).toBe(200);
    },20000)

    //invalid productid
 test("can upadte invalid",async()=>{
        const res = await request(app)
        .put(`/api/products/${productidinvalid}`)
        .set("Authorization",`Bearer ${sellertoken}`)
        .send({
        name: " updated Acer",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
        })

        expect(res.statusCode).toBe(500);
    },20000)


    //seller can update aother seller product

    test("can up aother pro",async()=>{
        const res = await request(app)
        .put(`/api/products/${productid}`)
        .set("Authorization",`Bearer ${sellertoken2}`)
        .send({
        name: " updated2 Acer",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
        })
        expect(res.statusCode).toBe(403)
    },20000)



    //admin can upadte any product
    test("admin can update",async()=>{
        const res  = await request(app)
        .put(`/api/products/${productid}`)
        .set("Authorization",`Bearer ${admintoken}`)
        .send({
        name: " admin updated Acer",
        price: 50000,
        quantity: 10,
        location: "Chennai",
        image: "base64image"
        })

        expect(res.statusCode).toBe(200)
    },20000)

    //another seller cannot del

    test("can del another pro",async()=>{
        const res = await request(app)
        .delete(`/api/products/${productid}`)
        .set("Authorization",`Bearer ${sellertoken2}`)
        expect(res.statusCode).toBe(403)
    },20000)

     //buyer can del

    test("buyer can del?",async()=>{
        const res = await request(app)
        .delete(`/api/products/${productid}`)
        .set("Authorization",`Bearer ${buyertoken}`)

        expect(res.statusCode).toBe(403);
    },20000)

    //seller can del;
    test("can delete",async()=>{
        const res = await request(app)
            .delete(`/api/products/${productid}`)
            .set("Authorization",`Bearer ${sellertoken}`)

            expect(res.statusCode).toBe(200);
        
    },20000)


    


    //buyer can get all the products
    test("buyer can get all",async()=>{
        const res = await request(app)
        .get("/api/products")
        .set("Authorization",`Bearer ${buyertoken}`)
        expect(res.statusCode).toBe(200);
    },20000)

    //admin get all products


    test("admin can get all",async()=>{
        const res = await request(app)
        .get("/api/products")
        .set("Authorization",`Bearer ${admintoken}`)
        expect(res.statusCode).toBe(200);
    },20000)

 afterAll(async()=>{
        await mongoose.connection.close();
    })

})