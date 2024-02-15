// this piece of code involves Github token which expires after 1 year so yes it is needed to be manually updated each year

import { Octokit } from "@octokit/rest";
import fs from "fs";
import "../environment.js"
// import path from "path"

// Authentication
const octokit = new Octokit({
  auth: process.env.Github_Storage_rep_token,
});

// Repository Information
const owner = process.env.Github_username;
const repo = process.env.Github_Storage_rep_name;
const branch = "main";

// Path to the image file

async function uploadToGitHub(imagePath,uploadPath) {
  try {
    const imageContent = fs.readFileSync(imagePath);
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: uploadPath, // Specify the path where you want to upload the image
      message: "Upload image",
      content: imageContent.toString("base64"),
      branch,

    });
    return response.data.content.download_url
  } catch (error) {
    return false
    // throw new Error(error)
  }
}


async function deleteFromGitHub(filePath) {
  try {
    // const filePath = ; // Path to the file to delete

    const { data: { sha } } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    await octokit.repos.deleteFile({
      owner,
      repo,
      path: filePath,
      message: "Delete file via API",
      sha: sha,
    });
    return true
  } catch (error) {
    return false
  }
}

// console.log(await uploadToGitHub());
await deleteFromGitHub("gift/Untitled.png")


export {uploadToGitHub,deleteFromGitHub}