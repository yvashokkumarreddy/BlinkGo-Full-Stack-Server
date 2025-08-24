import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
import { admin } from '../middleware/Admin.js'

const productRouter = Router()

productRouter.post("/create",admin,createProductController)
productRouter.post('/get',getProductController)
productRouter.post("/get-product-by-category",getProductByCategory)
productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/get-product-details',getProductDetails)

//update product
productRouter.put('/update-product-details',admin,updateProductDetails)

//delete product
productRouter.delete('/delete-product',admin,deleteProductDetails)

//search product 
productRouter.post('/search-product',searchProduct)

export default productRouter