import ProductModel from "../models/product.model.js";
import ExcelJS from "exceljs";
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProductController = async(request,response,next)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            categoryId,
            subCategoryId,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        } = request.body 

        if(!name || !image[0]  ||  !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }
        const lastCategory = await ProductModel.findOne().sort({productId: -1});
                console.log("lastCtegory", lastCategory.productId)
                const sub_category_id = lastCategory?lastCategory.productId + 1 : 1;
        const product = new ProductModel({
            name ,
            image ,
            category,
            productId: sub_category_id,
            categoryId,
            subCategoryId,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        });

        const saveProduct = await product.save();

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        });

    } catch (error) {
        next(error)
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        });
    }
}


export const getProductController = async(request,response)=>{
    try {
        
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = search ? {
            $text : {
                $search : '%search%'
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit)
            // .populate('Category')
            ,
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const { categoryId } = request.body 
        // console.log("categoryId",categoryId,"=======")
        if(!categoryId){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            categoryId :  categoryId 
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
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

export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = request.body
        console.log("LIkjghfh vhgyhf",request.body)
        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            categoryId : { $in :categoryId  },
            subCategoryId : { $in : subCategoryId }
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
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

export const  getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 
        console.log(productId,"raestdyfugiop75647867655647564564")
        const product = await ProductModel.findOne({ productId : Number(productId) })
        console.log("-=-0-=00=",product)

        return response.json({
            message : "product details",
            data : product,
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

export const updateProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        if(!productId){
            return response.status(400).json({
                message : "provide product productId",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ productId : productId },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
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

export const deleteProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        if(!productId){
            return response.status(400).json({
                message : "provide productId ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({productId : productId })

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const searchProduct = async (req, res) => {
  try {
    let { search, page, limit } = req.body;

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const skip = (page - 1) * limit;

    // Case-insensitive search on product name
    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return res.json({
      message: "Product data",
      success: true,
      error: false,
      data: data,
      totalCount: totalCount,
      totalPage: Math.ceil(totalCount / limit),
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
      error: true,
    });
  }
};






// export const downloadProductTemplate = async (req, res, next) => {
//   try {

//     console.log("eerror")
//     const filePath = path.join(__dirname, "../templates/Product_Import_Template.xlsx");
//     console.log("filePath",filePath)
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=Product_Import_Template.xlsx"
//     );

//     res.sendFile(filePath, (err) => {
//       if (err) {
//         console.error("SendFile Error:", err);
//         res.status(500).json({ message: "Error sending template" });
//       }
//     });
//   } catch (error) {
//     console.error("Download error:", error);
//     next(error)
//     res.status(500).json({ message: "Error downloading template" });
//   }
// };



// import path from "path";

// import ExcelJS from "exceljs";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";

export const downloadProductTemplate = async (req, res) => {
  try {
    // Fetch categories & subcategories from MongoDB
    const categories = await CategoryModel.find({}, { categoryId: 1, name: 1 }).lean();
    const subCategories = await SubCategoryModel.find({}, { SubCategoryId: 1, name: 1 }).lean();

    // Map to simple name arrays for dropdown
    const categoryNames = categories.map(c => c.name);
    const subCategoryNames = subCategories.map(s => s.name);

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Products");

    // Define columns
    ws.columns = [
      { header: "name", key: "name", width: 25 },
      { header: "price", key: "price", width: 15 },
      { header: "categoryName", key: "categoryName", width: 25 },
      { header: "subCategoryName", key: "subCategoryName", width: 25 },
      { header: "stock", key: "stock", width: 15 },
      { header: "description", key: "description", width: 30 },
    ];

    // Apply dropdowns directly in the main sheet (no extra sheets)
    for (let row = 2; row <= 100; row++) {
      ws.getCell(`C${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`"${categoryNames.join(",")}"`], // categoryName dropdown
      };
      ws.getCell(`D${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`"${subCategoryNames.join(",")}"`], // subCategoryName dropdown
      };
    }

    // Send Excel file
    res.setHeader("Content-Disposition", "attachment; filename=ProductImportTemplate.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
