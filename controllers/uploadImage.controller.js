import uploadImageClodinary from "../utils/uploadImageClodinary.js"

// const uploadImageController = async(request,response)=>{
//     try {
//         const file = request.file

//         const uploadImage = await uploadImageClodinary(file)

//         if (!uploadImage?.secure_url && !uploadImage?.url) {
//             throw new Error("No URL returned from Cloudinary");
//           }

//         return response.json({
//             message: "Upload done",
//             data: { url: uploadImage?.secure_url || uploadImage?.url },
//             success: true,
//             error: false,
//           });
//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// export default uploadImageController

const uploadImageController = async (req, res) => {
  try {
    const file = req.file;
    console.log("✅ Request received");
    console.log("📦 req.file:", file);

    if (!file) {
      throw new Error("❌ No file received. Check Multer setup and key name");
    }

    const uploaded = await uploadImageClodinary(file);

    if (!uploaded?.url) {
      throw new Error("❌ Image upload failed: no URL returned from Cloudinary");
    }

    return res.json({
      message: '✅ Upload successful',
      data: { url: uploaded.url },
      success: true
    });

  } catch (error) {
    console.error('❌ Upload Error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      success: false
    });
  }
};

export default uploadImageController;
