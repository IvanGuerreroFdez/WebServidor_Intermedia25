const multer=require('multer')
 
 const memory = multer.memoryStorage()
 
 const storage = multer.diskStorage({
     destination:  (req, file, callback) =>{
         console.log(file);
         const pathStorage = __dirname+"/../storage";
         callback(null, pathStorage) //error y destination
     },
     filename: (req, file, callback) => {
         //Tienen extensión jpg, pdf, mp4
         console.log(file);
         const ext = file.originalname.split(".").pop() //el último valor
         const filename = "file-"+Date.now()+"."+ext
         callback(null, filename)
     }
 })
 
 const uploadMiddleware = multer({storage}) //Middleware entre la ruta y el controlador
 
 const uploadMiddlewareMemory = multer({
    storage: memory,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

 module.exports = { uploadMiddleware, uploadMiddlewareMemory }