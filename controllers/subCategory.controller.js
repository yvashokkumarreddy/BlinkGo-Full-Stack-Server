import SubCategoryModel from "../models/subCategory.model.js";
import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";

export const AddSubCategoryController = async(request,response)=>{
    try {
        const { name, image, category } = request.body 

        if(!name && !image && !category[0] ){
            return response.status(400).json({
                message : "Provide name, image, category",
                error : true,
                success : false
            })
        }

        const payload = {
            name,
            image,
            category
        }

        const createSubCategory = new SubCategoryModel(payload)
        const save = await createSubCategory.save()

        return response.json({
            message : "Sub Category Created",
            data : save,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getSubCategoryController = async(request,response)=>{
    try {
        const data = await SubCategoryModel.find().sort({createdAt : -1}).populate('categoryId')
        return response.json({
            message : "Sub Category data",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


// export const assignSubCategoryIds = async () => {
//   try {
//     const categories = await CategoryModel.find().sort({ createdAt: 1 });
//     const subCategories = await SubCategoryModel.find().sort({ createdAt: 1 });
//     console.log("======",subCategories)
//    // Assign categoryId & stable subCategoryId
//     for (let i = 0; i < subCategories.length; i++) {
//       const sub = subCategories[i];
//       const parentCategoryObjectId = sub.category?.[0]
//       const catId = parentCategoryObjectId.toString()
//      const parentCategory = await CategoryModel.findOne({ _id: catId }) 
//         // Assign categoryId from parent
//       if (!sub.categoryId && parentCategory) {
//         const parent = categories.find(cat => cat._id.toString() === parentCategory._id.toString());
//         if (parent) {
//           sub.categoryId = parent.categoryId;
//         }
//       }

//       // Assign subCategoryId based on existing _id ordering (stable)
//       if (!sub.subCategoryId) {
//         sub.subCategoryId = parseInt(sub._id.toString().slice(-6), 16); 
//         // Example: take last 6 chars of ObjectId as number
//       }

//       await sub.save();
//     }

//     console.log("✅ Subcategories updated with categoryId & stable subCategoryId");
//   } catch (err) {
//     console.error("Error updating subcategories:", err);
//   }
// };





export const assignSubCategoryIds = async () => {
  try {
    const categories = await CategoryModel.find();
    const subCategories = await SubCategoryModel.find();
    const products = await ProductModel.find().sort({ createdAt: 1 }); // sort for stable order
    let counter = 1; // for sequential productId
    console.log(products)
    for (let product of products) {
      // === Map subCategory first ===
      const parentSubCategoryObjectId = product.subCategory?.[0];
      const parentCategoryObjectId = product.category?.[0];
        console.log(parentCategoryObjectId)
      if (parentSubCategoryObjectId) {
        const subCat = subCategories.find(
          (s) => s._id.toString() === parentSubCategoryObjectId.toString()
        );
        if (subCat) {
            console.log("inside if subcast",subCat)
          product.subCategoryId = subCat.subCategoryId; // numeric id
          product.categoryId = subCat.categoryId; // inherit from subCat
        }
      }

      // === If only category exists ===
      if (!parentSubCategoryObjectId && parentCategoryObjectId) {
        const cat = categories.find(
          (c) => c._id.toString() === parentCategoryObjectId.toString()
        );
        if (cat) {
          product.categoryId = cat.categoryId;
        }
      }

      // === Assign productId (sequential) ===
      if (!product.productId) {
        product.productId = counter;
        counter++;
      }

       await product.save();
    }

    console.log("✅ Products updated with categoryId, subCategoryId & productId");
  } catch (err) {
    console.error("❌ Error updating products:", err);
  }
};



export const updateSubCategoryController = async (request, response) => {
  try {
    const { subCategoryId, name, image, categoryId } = request.body;

    // find using your custom field, not Mongo _id
    const checkSub = await SubCategoryModel.findOne({ subCategoryId });

    if (!checkSub) {
      return response.status(400).json({
        message: "Check your subCategoryId",
        error: true,
        success: false,
      });
    }

    const updateSubCategory = await SubCategoryModel.findOneAndUpdate(
      { subCategoryId },   // filter by your field
      { name, image, categoryId },
      { new: true }        // return updated document
    );

    return response.json({
      message: "Updated Successfully",
      data: updateSubCategory,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


export const deleteSubCategoryController = async(request,response)=>{
    try {
        const { subCategoryId } = request.body 
        console.log("Id",subCategoryId)
        const deleteSub = await SubCategoryModel.findByIdAndDelete(subCategoryId)

        return response.json({
            message : "Delete successfully",
            data : deleteSub,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
