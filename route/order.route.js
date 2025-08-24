import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe } from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",CashOnDeliveryOrderController)
orderRouter.post('/checkout',paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",getOrderDetailsController)

export default orderRouter 