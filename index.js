import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
// import payments from 'razorpay/dist/types/payments.js/.'
import paymentsRouter from './route/payments.route.js'



const app = express()
app.use(
  cors({
    origin:  "http://localhost:5173" , // frontend origin (adjust in prod)
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json())
app.use(cookieParser())
app.use(morgan())
if (process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
}
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = 6502 || process.env.PORT 
app.get("/healthz",(req,res)=>res.send("ok"))
app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/user',userRouter)
app.use("/category",categoryRouter)
app.use("/file",uploadRouter)
app.use("/subcategory",subCategoryRouter)
app.use("/product",productRouter)
app.use("/cart",cartRouter)
app.use("/address",addressRouter)
app.use("/order", orderRouter)
app.use("/payments",paymentsRouter)

app.use(express.urlencoded({extended: true}))


connectDB().then(()=>{
    app.listen(PORT,'0.0.0.0',()=>{
        console.log("Server is running http://0.0.0.0:",PORT)
    })
})


