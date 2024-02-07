import "../environment.js"

import simpleGit from "simple-git"
import fs from "fs"
import path from "path"

// Path to your Git repository
// console.log(path.relative())
// const repoPath = "D:/junk/UploadTrash/";
const repoPath1 = "E:/ACM-Backend"
const repoPath2 = "E:/ACM-Backend/upload"


export const saveImageOnGit = async (imagePath) => {
    // console.log(imagePath)

    fs.readFile(imagePath, (err, data) => {

        imagePath = path.resolve(imagePath)
        // imagePath = path.join(imagePath.slice(1,imagePath.length))
        if (err) {
            console.error('Error reading image file:', err);
            return;
        }

        // Initialize simple-git with the repository path
        const git = simpleGit(repoPath1);

        // Add the image file to the staging area
        git.add(imagePath)
            .then()
            .then(() => {
                git.push('origin', 'main')
                console.log('Image file committed successfully.');

            })
            .catch((err) => {
                console.error('Error committing image file:', err);
            });


    });
    /*The path coming from multer req.file.path contains the "/upload" but we don't need it for because the git is initialised for that rep only*/
    fs.readFile(imagePath, (err, data) => {

        imagePath = path.resolve(imagePath)
        // imagePath = path.join(imagePath.slice(1,imagePath.length))
        if (err) {
            console.error('Error reading image file:', err);
            return;
        }

        // Initialize simple-git with the repository path
        const git = simpleGit(repoPath2);

        // Add the image file to the staging area
        git.add(imagePath)
            .then()
            .then(() => {
                git.push('origin', 'main')
                console.log('Image file committed successfully.');

            })
            .catch((err) => {
                console.error('Error committing image file:', err);
            });


    });




}