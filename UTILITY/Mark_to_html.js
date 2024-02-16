import MarkdownIt from "markdown-it";

const marked = (text)=>{
    const md = new MarkdownIt({
        html: true // Enable HTML tag support
      });
    return md.render(text)
};

// Output the HTML
export default marked