import { Router } from 'express'
import auth from '../middleware/auth.js'
import { AddCategoryController, assignCategoryIdToExisting, deleteCategoryController, getCategoryController, updateCategoryController } from '../controllers/category.controller.js'

const categoryRouter = Router()

categoryRouter.post("/add-category",AddCategoryController)
categoryRouter.get('/get',getCategoryController)
categoryRouter.put('/update',updateCategoryController)
categoryRouter.put('/assignCategoryIdToExisting',assignCategoryIdToExisting)
categoryRouter.delete("/delete",auth,deleteCategoryController)

export default categoryRouter