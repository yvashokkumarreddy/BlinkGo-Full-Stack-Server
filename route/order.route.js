import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, deleteOrder, getAllOrdersController, getOrderById, getOrderDetailsController, paymentController, reserveItems, updateOrderStatus, webhookStripe } from '../controllers/order.controller.js'


const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.post('/delete',auth,deleteOrder)
orderRouter.post('/all-orders',auth,getAllOrdersController)
orderRouter.post('/admin/reserve-items',auth,reserveItems)
orderRouter.post('/order-details',auth,getOrderById)
orderRouter.post('/update-order-status',auth,updateOrderStatus)
export default orderRouter 