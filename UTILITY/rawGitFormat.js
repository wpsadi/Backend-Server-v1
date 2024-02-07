import gitUserName from 'git-user-name';
import path from "path"
import querystring from "querystring"
const username = gitUserName();

// syntax = https://raw.githubusercontent.com/wpsadi/TT/master/README.md
const Repname = "ACM-Backend-uploads";


export const RawURL = (Filepath)=>{
    let arrFilePath = Filepath.split(path.sep)
    arrFilePath = arrFilePath.slice(1,arrFilePath.length)

    let urlPath = ["raw.githubusercontent.com",username,Repname,"main",...arrFilePath].join("/")
    // urlPath.replaceAll("\\","/")


    return `https://${querystring.escape(urlPath).replaceAll("%2F","/")}`
}


