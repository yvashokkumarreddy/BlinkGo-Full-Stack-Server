import { Router } from "express";
import auth from "../middleware/auth.js";
import { AddSubCategoryController, assignSubCategoryIds, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js";

const subCategoryRouter = Router()

subCategoryRouter.post('/create',AddSubCategoryController)
subCategoryRouter.post('/get',getSubCategoryController)
subCategoryRouter.put('/update',updateSubCategoryController)
subCategoryRouter.put('/assignSubCategoryIdToExisting',assignSubCategoryIds)
subCategoryRouter.delete('/delete',deleteSubCategoryController)

export default subCategoryRouter