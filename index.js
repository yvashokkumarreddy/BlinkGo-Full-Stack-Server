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



const app = express()
app.use(cors({
    credentials : true,
    origin : process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = 6502 || process.env.PORT 

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

app.use(express.urlencoded({extended: true}))


connectDB().then(()=>{
    app.listen(PORT,'192.168.1.17',()=>{
        console.log("Server is running http://0.0.0.0:",PORT)
    })
})

