import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";

export const AddCategoryController = async(request,response)=>{
    try {
        const { name , image } = request.body 

        if(!name || !image){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const addCategory = new CategoryModel({
            name,
            image
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return response.status(500).json({
                message : "Not Created",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Add Category",
            data : saveCategory,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getCategoryController = async(request,response)=>{
    try {
        
        const data = await CategoryModel.find().sort({ createdAt : -1 })

        return response.json({
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.messsage || error,
            error : true,
            success : false
        })
    }
}

export const updateCategoryController = async(request,response)=>{
    try {
        const { categoryId ,name, image } = request.body 
        let update;
        // console.log("k34567890",categoryId)
        if(categoryId ==undefined){
        update = await CategoryModel.updateOne({
            categoryId : categoryId
        },{
           name, 
           image 
        })
    }

        return response.json({
            message : "Updated Category",
            success : true,
            error : false,
            data : update
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export const assignCategoryIdToExisting = async () => {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: 1 });
    for (let i = 0; i < categories.length; i++) {
      if (!categories[i].categoryId) {
        categories[i].categoryId = i + 1; // assign 1,2,3...
        await categories[i].save();
      }
    }
    console.log("All categories updated with categoryId");
  } catch (err) {
    console.error("Error assigning categoryId:", err);
  }
};

export const deleteCategoryController = async(request,response)=>{
    try {
        const { categoryId } = request.body 

        const checkSubCategory = await SubCategoryModel.find({
            categoryId : {
                "$in" : [ categoryId ]
            }
        }).countDocuments()

        const checkProduct = await ProductModel.find({
            categoryId : {
                "$in" : [ categoryId ]
            }
        }).countDocuments()

        if(checkSubCategory >  0 || checkProduct > 0 ){
            return response.status(400).json({
                message : "Category is already use can't delete",
                error : true,
                success : false
            })
        }

        const deleteCategory = await CategoryModel.deleteOne({ categoryId : categoryId})

        return response.json({
            message : "Delete category successfully",
            data : deleteCategory,
            error : false,
            success : true
        })

    } catch (error) {
       return response.status(500).json({
            message : error.message || error,
            success : false,
            error : true
       }) 
    }
}