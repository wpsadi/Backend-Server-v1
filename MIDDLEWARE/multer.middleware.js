import path from "path";

import multer from "multer";

const destination = "upload/"

const upload = function(Storepath=""){
  // console.log(Storepath)
  return multer({
    dest: path.join(destination,Storepath),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(destination,Storepath));
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}`+(file.originalname.split(" ")).join("-"));
      },
    }),
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".webp" && ext !== ".png" && ext !== ".mp4" && ext!==".pdf") {
        cb(new Error("Invalid image file",false));
        return;
      }
      cb(null, true);
    },
  });
}



export default upload;

