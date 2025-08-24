import { Router } from "express";
import auth from "../middleware/auth.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";

const cartRouter = Router()

cartRouter.post('/create',addToCartItemController)
cartRouter.get("/get",getCartItemController)
cartRouter.put('/update-qty',updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',deleteCartItemQtyController)

export default cartRouter