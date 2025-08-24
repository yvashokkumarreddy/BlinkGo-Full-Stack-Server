// import multer from 'multer'

// const storage = multer.memoryStorage()

// const upload = multer({ storage : storage })

// export default upload

import multer from 'multer';
const storage = multer.memoryStorage(); // Important: memory, not disk
const upload = multer({ storage });

export default upload