// this piece of code involves Github token which expires after 1 year so yes it is needed to be manually updated each year

import { Octokit } from "@octokit/rest";
import fs from "fs";
import "../environment.js"
import path from "path"
import crypto from "crypto"

// Authentication
const octokit = new Octokit({
  auth: `${process.env.GitHub_Storage_rep_token_part1}${process.env.GitHub_Storage_rep_token_part2}`,
});

// Repository Information
const owner = process.env.Github_username;
const repo = process.env.Github_Storage_rep_name;
const branch = "main";

// Path to the image file
function calculateFileHash(content) {
  const hash = crypto.createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}

async function uploadToGitHub(imagePath,uploadPath) {
  // console.log(path.resolve(imagePath))
  try {
    const imageContent = fs.readFileSync(path.resolve(imagePath));

    const hash = calculateFileHash(imageContent);
    const size = imageContent.length;
    const pointerContent = `version https://git-lfs.github.com/spec/v1\noid sha256:${hash}\nsize ${size}`;
    
    const responsePointer = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `${uploadPath}.gitattributes`, // Append .png to the upload path to ensure it's treated as an LFS object
      message: "Created LFS",
      content: Buffer.from(pointerContent).toString('base64'),
      branch
    });



    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: uploadPath, // Specify the path where you want to upload the image
      message: "Upload image",
      content: imageContent.toString("base64"),
      branch
    });
    return response.data.content.download_url
  } catch (error) {
    console.log(error.message)
    return false
    // throw new Error(error)
  }
}


async function deleteFromGitHub(filePath) {
  try {
    // const filePath = ; // Path to the file to delete

    //remove the pointer
    try{
      let shaPointer = await octokit.repos.getContent({
        owner,
        repo,
        path: `${filePath}.gitattributes`,
      });
  
      shaPointer = shaPointer.data.sha
  
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: `${filePath}.gitattributes`,
        message: "Delete attribute file via API",
        sha: shaPointer,
      });
    }catch(e){
      null
    }

    //remove the file
    try{
      let shaFile = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
      });
  
      shaFile = shaFile.data.sha
  
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: filePath,
        message: "Delete file via API",
        sha: shaFile,
      });
    }catch(e){
      null
    }

     

    return true
  } catch (error) {
    // console.log(error.message)
    return false
  }
}

// console.log(await uploadToGitHub("x.png","blog/x1.png"));

export {uploadToGitHub,deleteFromGitHub}