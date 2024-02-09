/* for continuously keeping the server 
the server after creating the express app will do */
import "./environment.js"
import axios from "axios";

const RenderURL = process.env.renderDomain;
const intervalCall = process.env.rederDomainCallingTimeInerval;


export const stayAfloatAPI =() => {
    if (intervalCall && RenderURL) {
        setInterval(async () => {
            try {
                await axios.get(RenderURL)
            }
            catch (e) {
                null
            }
        }, intervalCall) 
    }

} 
