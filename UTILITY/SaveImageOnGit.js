import "../environment.js"

import simpleGit from "simple-git"
import fs from "fs"
import path from "path"

// Path to your Git repository
// console.log(path.relative())
// const repoPath = "D:/junk/UploadTrash/";
const repoPath = "E:/ACM-Backend/"
// console.log(repoPath)


// Path to the image file you want to commit
// const imagePath = 'path/to/your/image.jpg';

// Read the image file

export const saveImageOnGit = async(imagePath)=>{
    console.log(imagePath)
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            console.error('Error reading image file:', err);
            return;
        }
    
        // Initialize simple-git with the repository path
        const git = simpleGit(repoPath);
    
        // Add the image file to the staging area
        git.add(imagePath)
            .then(() => {
                // Commit the changes with a message
                return git.commit('Add image file: ' + imagePath);
            })
            .then(() => {
                git.push('origin', 'main')
                console.log('Image file committed successfully.');
            })
            .catch((err) => {
                console.error('Error committing image file:', err);
            });
    });

}